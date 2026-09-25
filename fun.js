// Fun layer: original van illustration, loader, confetti, nudge copy.
export const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const BAG_COLORS = ["#7DE0FF", "#ABFFE3", "#FFC39A", "#FF3BAE", "#B595FF", "#FFAFEF", "#00EDFF"];
const LINE = "#2A0F4F";

// bags: [{ on: bool, fresh: bool, name }]
export function van({ bags = [], moving = false, scene = true, cls = "", label = "Trip van" } = {}) {
  const n = Math.max(bags.length, 1);
  const rackX = 112, rackW = 136, slot = rackW / n, bw = Math.min(26, slot - 4);
  const bagEls = bags.map((b, i) => {
    const x = rackX + i * slot + (slot - bw) / 2, h = 16 + (i % 2) * 4, y = 84 - h;
    const c = BAG_COLORS[i % BAG_COLORS.length];
    return b.on
      ? `<g class="bag on ${b.fresh ? "fresh" : ""}" style="--d:${i * 90}ms"><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="${c}" stroke="${LINE}" stroke-width="3"/><path d="M${x + bw / 2 - 5} ${y} v-4 h10 v4" fill="none" stroke="${LINE}" stroke-width="3"/><title>${b.name} is packed</title></g>`
      : `<g class="bag off"><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 4" opacity=".55"/><title>Waiting on ${b.name}</title></g>`;
  }).join("");
  return `<svg class="van ${moving ? "moving" : ""} ${cls}" viewBox="0 0 360 210" role="img" aria-label="${label}">
  <defs><linearGradient id="vbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFAFEF"/><stop offset="1" stop-color="#B595FF"/></linearGradient></defs>
  ${scene ? `<g class="scene">
    <g class="sunwrap"><circle cx="78" cy="72" r="46" fill="none" stroke="#FFC39A" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 9" class="rays"/><circle cx="78" cy="72" r="30" fill="#FFC39A"/></g>
    <path class="hills" d="M-10 176 L68 104 L118 146 L196 78 L270 140 L312 112 L370 160 L370 176 Z" fill="rgba(181,149,255,.22)" stroke="#B595FF" stroke-width="3" stroke-linejoin="round"/>
    <path d="M176 96 L196 78 L214 94 L204 98 L196 92 L186 100 Z" fill="#F7F1FF" opacity=".8"/>
    <g class="cloud c1"><path d="M232 44 h44 a9 9 0 0 0 0 -18 a13 13 0 0 0 -24 -6 a10 10 0 0 0 -20 6 a9 9 0 0 0 0 18z" fill="rgba(255,255,255,.18)" stroke="#CDBFEA" stroke-width="3"/></g>
    <g class="cloud c2"><path d="M300 76 h32 a7 7 0 0 0 0 -14 a10 10 0 0 0 -18 -4 a8 8 0 0 0 -14 4 a7 7 0 0 0 0 14z" fill="rgba(255,255,255,.14)" stroke="#CDBFEA" stroke-width="3"/></g>
    <path class="bird b1" d="M160 34 q5 -6 10 0 q5 -6 10 0" fill="none" stroke="#CDBFEA" stroke-width="3" stroke-linecap="round"/>
    <path class="bird b2" d="M190 22 q4 -5 8 0 q4 -5 8 0" fill="none" stroke="#CDBFEA" stroke-width="3" stroke-linecap="round"/>
  </g>` : ""}
  <line class="road" x1="0" y1="186" x2="360" y2="186" stroke="#FFAFEF" stroke-width="4" stroke-linecap="round" stroke-dasharray="22 12"/>
  <g class="speed" stroke="#7DE0FF" stroke-width="3" stroke-linecap="round"><line x1="40" y1="120" x2="76" y2="120"/><line x1="54" y1="138" x2="82" y2="138"/><line x1="36" y1="156" x2="70" y2="156"/></g>
  <g class="vanbody">
    <line x1="108" y1="84" x2="252" y2="84" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
    <line x1="120" y1="84" x2="120" y2="90" stroke="${LINE}" stroke-width="4"/><line x1="240" y1="84" x2="240" y2="90" stroke="${LINE}" stroke-width="4"/>
    ${bagEls}
    <path d="M92 150 V112 Q92 90 114 89 L232 88 Q250 88 262 106 L278 130 Q282 136 282 144 V150 Q282 160 272 160 H100 Q92 160 92 150Z" fill="url(#vbody)" stroke="${LINE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M94 136 H280" stroke="#FF3BAE" stroke-width="6" opacity=".85"/>
    <rect x="108" y="99" width="34" height="24" rx="6" fill="#7DE0FF" stroke="${LINE}" stroke-width="3.5"/>
    <rect x="150" y="99" width="42" height="24" rx="6" fill="#7DE0FF" stroke="${LINE}" stroke-width="3.5"/>
    <path d="M204 99 H246 Q252 99 255 104 L266 123 H204Z" fill="#7DE0FF" stroke="${LINE}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M114 105 l8 -4 M156 105 l10 -5 M212 105 l10 -5" stroke="#F7F1FF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="199" y1="99" x2="199" y2="156" stroke="${LINE}" stroke-width="2.5"/>
    <circle class="lamp" cx="276" cy="142" r="4.5" fill="#FFF4B0" stroke="${LINE}" stroke-width="2"/>
    <rect x="86" y="148" width="14" height="8" rx="3" fill="#CDBFEA" stroke="${LINE}" stroke-width="2.5"/>
    <rect x="276" y="148" width="12" height="8" rx="3" fill="#CDBFEA" stroke="${LINE}" stroke-width="2.5"/>
  </g>
  ${[132, 238].map((cx) => `<g class="wheel"><circle cx="${cx}" cy="162" r="18" fill="${LINE}"/><circle cx="${cx}" cy="162" r="8" fill="#ABFFE3"/><path d="M${cx - 13} 162 h26 M${cx} 149 v26" stroke="#ABFFE3" stroke-width="2.5" opacity=".7"/></g>`).join("")}
</svg>`;
}

// ── Loader ───────────────────────────────────────────────
export const LOADER_LINES = {
  load: ["Warming up the van…", "Checking who's been ghosting the group chat…", "Scrolling past 1,200 unread messages…", "Untangling five calendars…"],
  create: ["Starting the van…", "Printing your trip link…", "Hiding the WhatsApp poll where no one can find it…"],
  submit: ["Strapping your bag to the roof…", "Hiding your budget from the others…", "Telling the group you actually did it…"],
  publish: ["Weighing everyone's hard no's…", "Doing the maths nobody in the group wanted to do…", "Making sure no one gets steamrolled…"],
  lock: ["Printing the chart…", "Laminating the decision so no one can wriggle out…"],
  unlock: ["Peeling the lamination off…"],
  reopen: ["Opening the boot back up…"],
  vote: ["Dropping your vote in the box…"],
};

let loaderTimer = null;
function ensureLoader() {
  let el = document.getElementById("loader");
  if (!el) {
    el = document.createElement("div");
    el.id = "loader"; el.className = "loader"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
    el.innerHTML = `<div class="loader-card">${van({ moving: true, scene: true, label: "Van driving" })}<p class="loader-line"></p></div>`;
    document.body.appendChild(el);
  }
  return el;
}
export function showLoader(ctx = "load") {
  const el = ensureLoader(), lines = LOADER_LINES[ctx] || LOADER_LINES.load, p = el.querySelector(".loader-line");
  let i = 0; p.textContent = lines[0];
  clearInterval(loaderTimer);
  loaderTimer = setInterval(() => { i = (i + 1) % lines.length; p.classList.remove("swap"); void p.offsetWidth; p.classList.add("swap"); p.textContent = lines[i]; }, 1600);
  el.classList.add("show");
}
export function hideLoader() { clearInterval(loaderTimer); document.getElementById("loader")?.classList.remove("show"); }
// Runs a promise with the loader; keeps it up long enough to be seen, never long enough to annoy.
export async function withLoader(ctx, fn, min = 650) {
  showLoader(ctx);
  const t = Date.now();
  try { return await fn(); }
  finally { const left = min - (Date.now() - t); if (left > 0 && !reduceMotion()) await new Promise((r) => setTimeout(r, left)); hideLoader(); }
}

// ── Confetti ─────────────────────────────────────────────
export function confetti({ x = innerWidth / 2, y = innerHeight / 3, n = 90, spread = 1 } = {}) {
  if (reduceMotion()) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.className = "confetti";
    s.style.cssText = `left:${x}px; top:${y}px; background:${BAG_COLORS[i % BAG_COLORS.length]}; ${i % 3 === 0 ? "border-radius:50%; width:9px; height:9px;" : ""}`;
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, v = (90 + Math.random() * 240) * spread;
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 160 * spread;
    s.animate(
      [{ transform: "translate(0,0) rotate(0deg)", opacity: 1 }, { transform: `translate(${dx}px, ${dy + 380}px) rotate(${Math.random() * 900}deg)`, opacity: 0 }],
      { duration: 1300 + Math.random() * 900, easing: "cubic-bezier(.15,.7,.4,1)" }
    ).onfinish = () => s.remove();
  }
}

// ── Nudge copy ───────────────────────────────────────────
export const NUDGES = [
  "No form, no Goa. Those are the rules.",
  "Five minutes of your time vs. three more months of “we should plan something soon.”",
  "Our laziness has cancelled more trips than the monsoon.",
  "1,200 messages. 0 trips. Let's change one of those numbers.",
  "Be the friend who fills the form, not the one who says “I'm in, just tell me the dates.”",
  "The cheap flights won't wait. Neither will the group's patience.",
];

export function nudgeHeadline(pending, me, meSubmitted) {
  if (!pending.length) return { title: "Everyone's on the roof rack.", body: "The options are cooking. Go pack something." };
  if (meSubmitted) return { title: "Your bag's on the roof. Now go poke people.", body: `Still waiting on ${list(pending)}. Forward the link. Be annoying about it.` };
  if (pending.length === 1 && pending[0] === me) return { title: `It's literally just you, ${me}.`, body: "Everyone else is packed. The van is idling. The group is staring." };
  return { title: "The van's packed. Your form isn't.", body: `Please, at least fill the form. Our collective laziness is the only thing standing between us and a beach. Waiting on ${list(pending)}.` };
}
const list = (a) => a.length <= 2 ? a.join(" and ") : `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`;
