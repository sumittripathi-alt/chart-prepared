// Tiny Upstash Redis REST client (no dependencies).
// Vercel's Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN
// (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) automatically.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storageMode = URL_ && TOKEN ? "redis" : "memory";
const mem = globalThis.__tripMem || (globalThis.__tripMem = new Map());

async function cmd(...args) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const TTL = 60 * 60 * 24 * 180; // keep trips 180 days

export async function getJSON(key) {
  if (storageMode === "memory") return mem.has(key) ? JSON.parse(mem.get(key)) : null;
  const v = await cmd("GET", key);
  return v ? JSON.parse(v) : null;
}
export async function setJSON(key, val) {
  if (storageMode === "memory") { mem.set(key, JSON.stringify(val)); return; }
  await cmd("SET", key, JSON.stringify(val), "EX", TTL);
}
// Hash per trip so concurrent submissions from different people don't overwrite each other.
export async function hset(key, field, val) {
  if (storageMode === "memory") { const h = JSON.parse(mem.get(key) || "{}"); h[field] = val; mem.set(key, JSON.stringify(h)); return; }
  await cmd("HSET", key, field, JSON.stringify(val));
  await cmd("EXPIRE", key, TTL);
}
export async function hgetall(key) {
  if (storageMode === "memory") return JSON.parse(mem.get(key) || "{}");
  const arr = (await cmd("HGETALL", key)) || [];
  const out = {};
  for (let i = 0; i < arr.length; i += 2) out[arr[i]] = JSON.parse(arr[i + 1]);
  return out;
}
