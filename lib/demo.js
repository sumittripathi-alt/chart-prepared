// Sample preferences so the tool shows a working result before anyone submits.
import { makeWindows } from "./engine.js";

export function demoTrip() {
  const start = new Date().toISOString().slice(0, 10);
  const windows = makeWindows(start, 10, 3);
  const wk = windows.filter((w) => w.kind === "weekend").map((w) => w.id);
  const wd = windows.filter((w) => w.kind === "weekday").map((w) => w.id);
  const T = (beach, mountains, heritage, spiritual, adventure, nightlife) => ({ beach, mountains, heritage, spiritual, adventure, nightlife });
  const participants = [
    { name: "Riya",      prefs: { home: "Bengaluru", comfort: 22000, max: 30000, windows: [wk[2], wk[3], wk[5], wk[6], wd[4]], types: T(2, 1, 1, 0, 1, 1), tier: "mid", hardNos: [], excludeDest: [] } },
    { name: "Siddharth", prefs: { home: "Delhi",     comfort: 25000, max: 35000, windows: [wk[1], wk[3], wk[5], wk[6], wk[7]], types: T(1, 2, 1, 0, 2, 1), tier: "budget", hardNos: ["overnight"], excludeDest: [] } },
    { name: "Karan",     prefs: { home: "Mumbai",    comfort: 18000, max: 24000, windows: [wk[3], wk[4], wk[5], wk[6]], types: T(2, 1, 0, 0, 1, 2), tier: "hostel", hardNos: [], excludeDest: ["varanasi"] } },
    { name: "Aisha",     prefs: { home: "Hyderabad", comfort: 20000, max: 28000, windows: [wk[2], wk[3], wk[5], wk[6], wd[5]], types: T(1, 1, 2, 1, 0, 0), tier: "mid", hardNos: ["altitude", "hostel"], excludeDest: [] } },
    { name: "Preethi",   prefs: { home: "Kolkata",   comfort: 24000, max: 32000, windows: [wk[3], wk[5], wk[6], wk[7]], types: T(2, 2, 1, 1, 0, 0), tier: "mid", hardNos: ["long_road"], excludeDest: [] } },
  ];
  return { name: "College gang trip (demo)", nights: 3, windows, participants };
}
