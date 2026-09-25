// Deterministic trip scoring. Same inputs always give the same output.
import { DESTINATIONS, ROUTES, TIERS, TIER_LABEL, WEEKEND_MULTIPLIER, TRIP_TYPES } from "./data.js";

// All tunable weights live here.
export const WEIGHTS = { budget: 0.4, type: 0.3, tier: 0.15, travel: 0.15 };
export const LABELS = [ [75, "Great"], [50, "OK"], [0, "Stretch"] ];

const DAY = 86400000;
const round500 = (n) => Math.round(n / 500) * 500;
const fmtK = (n) => "₹" + (Math.round(n / 1000)) + "k";
const iso = (d) => d.toISOString().slice(0, 10);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const fmtDate = (s) => { const d = new Date(s + "T00:00:00Z"); return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };

// Date windows: for each week, a weekend window and a weekday window.
export function makeWindows(startISO, weeks, nights) {
  const start = new Date(startISO + "T00:00:00Z");
  const out = [];
  // first Monday on/after start
  let monday = new Date(start.getTime() + ((8 - start.getUTCDay()) % 7) * DAY);
  for (let w = 0; w < weeks; w++) {
    const wkStart = new Date(monday.getTime() + w * 7 * DAY);
    const weekday = wkStart; // Mon
    const weekendStart = new Date(wkStart.getTime() + (nights >= 4 ? 3 : 4) * DAY); // Thu or Fri
    for (const [kind, s] of [["weekday", weekday], ["weekend", weekendStart]]) {
      const end = new Date(s.getTime() + nights * DAY);
      const id = `${kind}-${iso(s)}`;
      out.push({ id, kind, start: iso(s), end: iso(end), label: `${fmtDate(iso(s))} – ${fmtDate(iso(end))}` });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

function nightlyRates(window, nights, pair) {
  let total = 0;
  const s = new Date(window.start + "T00:00:00Z");
  for (let i = 0; i < nights; i++) {
    const dow = new Date(s.getTime() + i * DAY).getUTCDay();
    total += (dow === 5 || dow === 6) ? pair[1] : pair[0];
  }
  return total;
}

// Cost and travel facts for one person on one candidate.
export function personCost(p, destKey, tier, window, nights) {
  const d = DESTINATIONS[destKey];
  const [fare, hours, mode] = ROUTES[destKey][p.home];
  const weekend = window.kind === "weekend";
  const travel = fare * (weekend ? WEEKEND_MULTIPLIER[mode] : 1) + (mode === "flight" ? d.transferCostRT : 0);
  const nightsCost = nightlyRates(window, nights, d.tiers[tier]);
  const stay = tier === "hostel" ? nightsCost : nightsCost / 2; // hotel rooms shared by 2
  const spend = d.dailySpend * (nights + 1);
  const oneWayHours = hours + (mode === "flight" ? d.transferHours : 0);
  const groundLeg = mode === "flight" ? d.transferHours : hours;
  return { total: round500(travel + stay + spend), oneWayHours, groundLeg, mode };
}

// Hard vetoes for one person. Returns array of categories.
export function vetoes(p, destKey, tier, window, cost) {
  const d = DESTINATIONS[destKey];
  const v = [];
  const no = p.hardNos || [];
  if (!(p.windows || []).includes(window.id)) v.push("dates");
  if ((p.excludeDest || []).includes(destKey)) v.push("hard no");
  else if (no.includes("altitude") && d.altitude) v.push("hard no");
  else if (no.includes("long_road") && cost.groundLeg > 6) v.push("hard no");
  else if (no.includes("overnight") && cost.mode !== "flight" && cost.oneWayHours >= 8) v.push("hard no");
  if (no.includes("hostel") && tier === "hostel") v.push("hard no");
  if (cost.total > p.max) v.push("budget");
  return [...new Set(v)];
}

function typeScore(p, d) {
  const best = Math.max(...d.types.map((t) => (p.types || {})[t] ?? 0));
  return { score: [10, 55, 100][best] ?? 10, best };
}

export function personFit(p, destKey, tier, window, nights) {
  const d = DESTINATIONS[destKey];
  const cost = personCost(p, destKey, tier, window, nights);
  const veto = vetoes(p, destKey, tier, window, cost);
  // budget
  let budget;
  if (cost.total <= p.comfort) budget = 100;
  else if (cost.total <= p.max) budget = 100 - 60 * (cost.total - p.comfort) / Math.max(1, p.max - p.comfort);
  else budget = 0;
  const type = typeScore(p, d);
  const tierGap = Math.abs(TIERS.indexOf(tier) - TIERS.indexOf(p.tier || "mid"));
  const tierS = [100, 65, 30, 0][tierGap];
  const h = cost.oneWayHours;
  const travelS = h <= 3 ? 100 : h >= 12 ? 30 : 100 - (70 * (h - 3)) / 9;
  const fit = Math.round(WEIGHTS.budget * budget + WEIGHTS.type * type.score + WEIGHTS.tier * tierS + WEIGHTS.travel * travelS);
  const label = LABELS.find(([min]) => fit >= min)[1];

  // Reasons, phrased relative to the person; never reveal raw budgets.
  const neg = [], pos = [];
  if (cost.total > p.comfort) neg.push(`about ${fmtK(cost.total - p.comfort)} over their comfortable budget`);
  else pos.push("within their comfortable budget");
  if (type.best === 0) neg.push("not a trip type they picked");
  else if (type.best === 2) pos.push("a trip type they love");
  if (h > 6) neg.push(`about ${Math.round(h)}h each way from ${p.home}`);
  else if (h <= 2.5) pos.push(`short trip from ${p.home}`);
  if (tierGap >= 2) neg.push(TIERS.indexOf(tier) > TIERS.indexOf(p.tier) ? "a pricier stay than they'd pick" : "a simpler stay than they'd like");
  const reasons = [...neg, ...pos].slice(0, 2);
  return { fit, label, reasons, cost: cost.total, veto };
}

// Main entry. participants: [{name, prefs|null}], trip: {nights, windows}
export function rank(trip, participants) {
  const people = participants.filter((x) => x.prefs);
  const nights = trip.nights;
  if (people.length === 0) return { options: [], note: "No one has submitted yet." };
  const cands = [];
  for (const destKey of Object.keys(DESTINATIONS)) {
    for (const tier of Object.keys(DESTINATIONS[destKey].tiers)) {
      for (const w of trip.windows) {
        const per = people.map((x) => ({ name: x.name, ...personFit({ ...x.prefs }, destKey, tier, w, nights) }));
        const vetoed = per.filter((r) => r.veto.length);
        const fits = per.map((r) => r.fit);
        cands.push({
          destKey, tier, window: w, per, vetoed,
          min: Math.min(...fits), avg: fits.reduce((a, b) => a + b, 0) / fits.length,
          avgCost: per.reduce((a, r) => a + r.cost, 0) / per.length,
        });
      }
    }
  }
  const order = (a, b) => b.min - a.min || b.avg - a.avg || a.avgCost - b.avgCost || a.window.start.localeCompare(b.window.start) || a.destKey.localeCompare(b.destKey) || a.tier.localeCompare(b.tier);
  const valid = cands.filter((c) => c.vetoed.length === 0).sort(order);

  const picked = [];
  for (const c of valid) { if (picked.length < 3 && !picked.some((p) => p.destKey === c.destKey)) picked.push(c); }
  for (const c of valid) { if (picked.length < 3 && !picked.includes(c)) picked.push(c); }

  const options = picked.map((c, i) => formatOption(c, i));
  const result = { options, basedOn: people.length, of: participants.length };

  if (options.length === 0) {
    result.blocker = explainBlocker(cands, people, trip);
    return result;
  }
  result.why = "Ranked by how well each option works for the person it suits least, then by the group average, so no one gets steamrolled.";
  result.excluded = explainExcluded(cands, people, picked);
  return result;
}

function formatOption(c, i) {
  const d = DESTINATIONS[c.destKey];
  const costs = c.per.map((r) => r.cost);
  return {
    id: `opt${i + 1}`,
    destKey: c.destKey, destination: d.name, gateway: d.gateway,
    tier: c.tier, tierLabel: TIER_LABEL[c.tier], limited: !!d.limited,
    window: c.window, weekend: c.window.kind === "weekend",
    costMin: Math.min(...costs), costMax: Math.max(...costs),
    minFit: c.min, avgFit: Math.round(c.avg),
    people: c.per.map(({ name, fit, label, reasons, cost }) => ({ name, fit, label, reasons, cost })),
  };
}

function describeVetoes(vetoed) {
  const counts = {};
  for (const r of vetoed) for (const v of r.veto) counts[v] = (counts[v] || 0) + 1;
  const phrase = { dates: "dates", "hard no": "a hard no", budget: "budget" };
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, n], i) => `${n}${i === 0 ? (n === 1 ? " person" : " people") : ""} on ${phrase[k]}`).join(" and ");
}

const dateVetoes = (c) => c.vetoed.filter((r) => r.veto.includes("dates")).length;
// Closest miss: fewest people ruled out, preferring dates everyone can make.
const closestMiss = (list) => [...list].sort((a, b) => a.vetoed.length - b.vetoed.length || dateVetoes(a) - dateVetoes(b) || b.min - a.min || a.window.start.localeCompare(b.window.start))[0];

function explainExcluded(cands, people, picked) {
  const shown = new Set(picked.map((p) => p.destKey));
  const popularity = (k) => people.reduce((a, x) => a + typeScore(x.prefs, DESTINATIONS[k]).best, 0);
  const rest = Object.keys(DESTINATIONS).filter((k) => !shown.has(k)).sort((a, b) => popularity(b) - popularity(a) || a.localeCompare(b));
  for (const k of rest) {
    const mine = cands.filter((c) => c.destKey === k);
    const closest = closestMiss(mine);
    if (closest && closest.vetoed.length) return `${DESTINATIONS[k].name} was the most-wanted place that didn't make it: it was ruled out for ${describeVetoes(closest.vetoed)}.`;
    if (closest) return `${DESTINATIONS[k].name} was popular but ranked lower on overall fit.`;
  }
  return null;
}

function explainBlocker(cands, people, trip) {
  const common = trip.windows.filter((w) => people.every((x) => (x.prefs.windows || []).includes(w.id)));
  if (common.length === 0) return `There's no date window all ${people.length} of you are free for. Ask everyone to mark a few more weekends or weekdays.`;
  const closest = closestMiss(cands);
  return `No option works for everyone yet. The closest was ${DESTINATIONS[closest.destKey].name} (${closest.window.label}), ruled out for ${describeVetoes(closest.vetoed)}. Loosening that is the quickest way to an answer.`;
}

export { TRIP_TYPES };
