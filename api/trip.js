import { getJSON, setJSON, hset, hgetall, storageMode } from "../lib/store.js";
import { rank, makeWindows } from "../lib/engine.js";
import { ORIGINS, TIERS, TRIP_TYPES, HARD_NOS, DESTINATIONS } from "../lib/data.js";
import crypto from "node:crypto";

const rid = (n) => crypto.randomBytes(n).toString("base64url");
const now = () => new Date().toISOString();
const bad = (res, code, msg) => res.status(code).json({ error: msg });

async function load(id) {
  if (!id || !/^[\w-]{4,40}$/.test(id)) return null;
  return getJSON(`trip:${id}`);
}

function publicView(trip, subs, votes, isAdmin) {
  const tally = {};
  for (const [name, opt] of Object.entries(votes)) if (opt) (tally[opt] ||= []).push(name);
  return {
    id: trip.id, name: trip.name, deadline: trip.deadline, nights: trip.nights, windows: trip.windows,
    participants: trip.participants.map((n) => ({ name: n, submitted: !!subs[n], submittedAt: subs[n]?.at || null, voted: votes[n] || null })),
    status: trip.status, snapshot: trip.snapshot || null, tally, decision: trip.decision || null,
    history: trip.history, isAdmin, storage: storageMode,
  };
}

function cleanPrefs(p, trip) {
  const num = (x) => Math.max(0, Math.min(1e7, Math.round(Number(x) || 0)));
  const comfort = num(p.comfort), max = Math.max(num(p.max), comfort);
  if (!ORIGINS.includes(p.home)) throw new Error("Pick your home city.");
  if (!comfort) throw new Error("Add a comfortable budget.");
  const winIds = new Set(trip.windows.map((w) => w.id));
  const windows = (p.windows || []).filter((w) => winIds.has(w));
  if (!windows.length) throw new Error("Mark at least one date window you're free.");
  const types = {};
  for (const t of TRIP_TYPES) types[t] = [0, 1, 2].includes(p.types?.[t]) ? p.types[t] : 1;
  return {
    home: p.home, comfort, max, windows, types,
    tier: TIERS.includes(p.tier) ? p.tier : "mid",
    hardNos: (p.hardNos || []).filter((h) => h in HARD_NOS),
    excludeDest: (p.excludeDest || []).filter((d) => d in DESTINATIONS),
  };
}

async function publish(trip, subs, by) {
  const participants = trip.participants.map((n) => ({ name: n, prefs: subs[n]?.prefs || null }));
  trip.snapshot = { result: rank(trip, participants), publishedAt: now() };
  trip.status = "voting";
  trip.history.push({ at: now(), event: by });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const trip = await load(req.query.id);
      if (!trip) return bad(res, 404, "This trip link doesn't exist or has expired.");
      const [subs, votes] = await Promise.all([hgetall(`subs:${trip.id}`), hgetall(`votes:${trip.id}`)]);
      return res.json(publicView(trip, subs, votes, req.query.k === trip.adminToken));
    }
    if (req.method !== "POST") return bad(res, 405, "Use GET or POST.");
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    if (b.action === "create") {
      const participants = [...new Set((b.participants || []).map((s) => String(s).trim().slice(0, 30)).filter(Boolean))];
      if (participants.length < 2 || participants.length > 12) return bad(res, 400, "Add between 2 and 12 people.");
      const nights = [2, 3, 4].includes(Number(b.nights)) ? Number(b.nights) : 3;
      const weeks = Math.min(16, Math.max(2, Number(b.weeks) || 10));
      const startISO = now().slice(0, 10);
      const trip = {
        id: rid(6), adminToken: rid(12), name: String(b.name || "Our trip").slice(0, 60),
        participants, nights, weeks, startISO, windows: makeWindows(startISO, weeks, nights),
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(b.deadline) ? b.deadline : null,
        status: "collecting", history: [{ at: now(), event: "Trip created" }], createdAt: now(),
      };
      await setJSON(`trip:${trip.id}`, trip);
      return res.json({ id: trip.id, adminToken: trip.adminToken, storage: storageMode });
    }

    const trip = await load(b.id);
    if (!trip) return bad(res, 404, "This trip link doesn't exist or has expired.");
    const isAdmin = b.k && b.k === trip.adminToken;
    const subsKey = `subs:${trip.id}`, votesKey = `votes:${trip.id}`;

    switch (b.action) {
      case "submit": {
        if (trip.status !== "collecting") return bad(res, 409, "Submissions are closed. The options are already out.");
        if (!trip.participants.includes(b.person)) return bad(res, 400, "Pick your name from the list.");
        let prefs;
        try { prefs = cleanPrefs(b.prefs || {}, trip); } catch (e) { return bad(res, 400, e.message); }
        await hset(subsKey, b.person, { prefs, at: now() });
        const subs = await hgetall(subsKey);
        if (trip.participants.every((n) => subs[n])) {
          const fresh = await load(trip.id);
          if (fresh.status === "collecting") { await publish(fresh, subs, "Everyone submitted — options published"); await setJSON(`trip:${trip.id}`, fresh); }
        }
        break;
      }
      case "publish": {
        if (!isAdmin) return bad(res, 403, "Only the organiser can do this.");
        if (trip.status !== "collecting") return bad(res, 409, "Options are already out.");
        const subs = await hgetall(subsKey);
        const n = trip.participants.filter((p) => subs[p]).length;
        if (!n) return bad(res, 400, "No one has submitted yet.");
        await publish(trip, subs, `Organiser published options with ${n} of ${trip.participants.length} submitted`);
        await setJSON(`trip:${trip.id}`, trip);
        break;
      }
      case "reopen": {
        if (!isAdmin) return bad(res, 403, "Only the organiser can do this.");
        if (trip.status !== "voting") return bad(res, 409, "Only open voting can be reopened.");
        trip.status = "collecting"; trip.snapshot = null;
        trip.history.push({ at: now(), event: "Organiser reopened submissions; votes cleared" });
        await setJSON(`trip:${trip.id}`, trip);
        for (const n of trip.participants) await hset(votesKey, n, null);
        break;
      }
      case "vote": {
        if (trip.status !== "voting") return bad(res, 409, trip.status === "decided" ? "The decision is locked." : "Voting hasn't opened yet.");
        if (!trip.participants.includes(b.person)) return bad(res, 400, "Pick your name from the list.");
        if (!trip.snapshot.result.options.some((o) => o.id === b.optionId)) return bad(res, 400, "Pick one of the options.");
        await hset(votesKey, b.person, b.optionId);
        break;
      }
      case "lock": {
        if (!isAdmin) return bad(res, 403, "Only the organiser can do this.");
        if (trip.status !== "voting") return bad(res, 409, "Nothing to lock right now.");
        const opt = trip.snapshot.result.options.find((o) => o.id === b.optionId);
        if (!opt) return bad(res, 400, "Pick one of the options.");
        trip.status = "decided"; trip.decision = { optionId: opt.id, lockedAt: now() };
        trip.history.push({ at: now(), event: `Decision locked: ${opt.destination}, ${opt.window.label}` });
        await setJSON(`trip:${trip.id}`, trip);
        break;
      }
      case "unlock": {
        if (!isAdmin) return bad(res, 403, "Only the organiser can do this.");
        if (trip.status !== "decided") return bad(res, 409, "Nothing is locked.");
        trip.status = "voting"; trip.history.push({ at: now(), event: "Organiser unlocked the decision" }); trip.decision = null;
        await setJSON(`trip:${trip.id}`, trip);
        break;
      }
      default: return bad(res, 400, "Unknown action.");
    }
    const [subs, votes] = await Promise.all([hgetall(subsKey), hgetall(votesKey)]);
    return res.json(publicView(await load(trip.id), subs, votes, !!isAdmin));
  } catch (e) {
    console.error(e);
    return bad(res, 500, "Something went wrong on the server. Try again in a moment.");
  }
}
