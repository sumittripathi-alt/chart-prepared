import { test } from "node:test";
import assert from "node:assert/strict";
import { rank, personCost, makeWindows } from "../lib/engine.js";
import { demoTrip } from "../lib/demo.js";

const windows = makeWindows("2026-10-01", 4, 3);
const wk = windows.filter((w) => w.kind === "weekend");
const wd = windows.filter((w) => w.kind === "weekday");
const T = { beach: 2, mountains: 1, heritage: 1, spiritual: 1, adventure: 1, nightlife: 1 };
const person = (name, over = {}) => ({ name, prefs: { home: "Mumbai", comfort: 30000, max: 40000, windows: windows.map((w) => w.id), types: T, tier: "mid", hardNos: [], excludeDest: [], ...over } });
const trip = { nights: 3, windows };

test("same input gives the same output", () => {
  const d = demoTrip();
  assert.deepEqual(rank(d, d.participants), rank(d, d.participants));
});

test("returns at most 3 options, distinct destinations first", () => {
  const r = rank(trip, [person("A"), person("B"), person("C")]);
  assert.equal(r.options.length, 3);
  assert.equal(new Set(r.options.map((o) => o.destKey)).size, 3);
});

test("date filter: only windows everyone is free for", () => {
  const r = rank(trip, [person("A", { windows: [wk[1].id, wk[2].id] }), person("B", { windows: [wk[2].id] })]);
  assert.ok(r.options.length > 0);
  assert.ok(r.options.every((o) => o.window.id === wk[2].id));
});

test("hard no on a destination is an absolute veto", () => {
  const r = rank(trip, [person("A"), person("B", { excludeDest: ["goa"] })]);
  assert.ok(r.options.every((o) => o.destKey !== "goa"));
});

test("no hostels and no altitude are respected", () => {
  const r = rank(trip, [person("A", { tier: "hostel" }), person("B", { hardNos: ["hostel", "altitude"] })]);
  assert.ok(r.options.every((o) => o.tier !== "hostel" && o.destKey !== "leh"));
});

test("weekend travel costs more than weekday travel", () => {
  const p = person("A").prefs;
  assert.ok(personCost(p, "goa", "mid", wk[0], 3).total > personCost(p, "goa", "mid", wd[0], 3).total);
});

test("tight budget: nothing over anyone's hard maximum", () => {
  const r = rank(trip, [person("A"), person("Tight", { comfort: 12000, max: 15000 })]);
  for (const o of r.options) assert.ok(o.people.find((x) => x.name === "Tight").cost <= 15000);
});

test("no valid option explains the main blocker", () => {
  const r = rank(trip, [person("A", { windows: [wk[0].id] }), person("B", { windows: [wk[1].id] })]);
  assert.equal(r.options.length, 0);
  assert.match(r.blocker, /date window/);
});

test("results never expose raw budgets or hard no's", () => {
  const d = demoTrip();
  const s = JSON.stringify(rank(d, d.participants));
  assert.ok(!s.includes('"comfort"') && !s.includes('"max"') && !s.includes("hardNos") && !s.includes("excludeDest"));
});
