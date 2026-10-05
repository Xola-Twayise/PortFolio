import { profile } from "./profile.js";
import * as AI from "./ai.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Boot sequence ─────────────────────────── */
(function boot() {
  const lines = [
    "> initializing neural interface…",
    "> loading identity: XOLA_TWAYISE",
    "> mounting knowledge graph … " + (AI.kb.length) + " nodes",
    "> webgpu: " + (AI.webgpuSupported ? "DETECTED" : "not available (retrieval mode)"),
    "> ai twin: standing by",
    "> welcome.",
  ];
  const log = $("#boot-log"), bar = $(".boot-bar i");
  let i = 0;
  const step = () => {
    if (i < lines.length) {
      log.textContent += lines[i] + "\n";
      bar.style.width = ((i + 1) / lines.length) * 100 + "%";
      i++; setTimeout(step, reduceMotion ? 0 : 170);
    } else setTimeout(() => $("#boot").classList.add("done"), 250);
  };
  step();
})();

/* ── Neural network background ─────────────── */
(function neural() {
  const c = $("#neural-bg"), ctx = c.getContext("2d");
  let w, h, nodes, mouse = { x: -999, y: -999 };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    const count = Math.min(110, Math.floor((innerWidth * innerHeight) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.6 + 0.6) * dpr, hue: Math.random() < 0.7 ? 186 : 305,
    }));
  }
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  resize();
  const link = 140 * dpr;
  let pulse = 0;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    pulse += 0.01;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
      if (d < 180 * dpr) { n.x -= dx * 0.004; n.y -= dy * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          const o = (1 - d / link) * 0.35;
          ctx.strokeStyle = `hsla(${a.hue},100%,60%,${o})`;
          ctx.lineWidth = dpr * 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
      if (md < link * 1.3) {
        ctx.strokeStyle = `rgba(255,61,242,${(1 - md / (link * 1.3)) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = `hsla(${a.hue},100%,70%,${0.6 + Math.sin(pulse + i) * 0.3})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
})();

/* ── Cursor glow ───────────────────────────── */
const glow = $("#cursor-glow");
addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

/* ── Render content from profile ───────────── */
function setPhoto(img, src) {
  const host = img.parentElement;
  if (!src) { host.classList.add("no-img"); return; }
  img.onerror = () => host.classList.add("no-img");
  img.src = src;
}
setPhoto($("#portrait-img"), profile.photos?.portrait);
setPhoto($("#about-img"), profile.photos?.outdoors);
setPhoto($("#event-img"), profile.photos?.event);

$("#hero-summary").textContent = profile.summary;
$("#hero-stats").innerHTML = profile.stats.map(([v, l]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("");
if (profile.cv) { const b = $("#cv-btn"); b.href = profile.cv; b.hidden = false; }

$("#about-text").innerHTML = profile.about.map((p) => `<p>${esc(p)}</p>`).join("");
$("#holo-meta").innerHTML = [
  ["ROLE", profile.title], ["BASE", profile.location], ["COMPANY", "JAS Worldwide"],
  ["EDUCATION", "BSc Computer Science, NMU"],
].map(([k, v]) => `<li><span>${k}</span><span>${esc(v)}</span></li>`).join("");

$("#skills-grid").innerHTML = profile.skills.map((g) => `
  <div class="glass skill-card reveal">
    <h3>${esc(g.group.toUpperCase())}</h3>
    ${g.items.map(([n, v]) => `<div class="skill"><div class="skill-top"><span>${esc(n)}</span><span>${v}%</span></div><div class="bar"><i data-w="${v}"></i></div></div>`).join("")}
  </div>`).join("");

const grid = $("#projects-grid");
grid.innerHTML = profile.projects.map((p, i) => `
  <article class="glass project reveal tilt${p.enterprise ? " enterprise" : ""}" data-i="${i}" style="--accent:${p.accent}">
    <span class="p-score"></span>
    <div class="p-top"><span class="p-tag">${esc(p.tag)}</span><span class="p-year">${esc(p.year)}</span></div>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.description)}</p>
    <div class="chips">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
    <div class="p-links">
      ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">▶ Live</a>` : ""}
      ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">⌥ Code</a>` : ""}
      <a href="#" data-ask="Tell me about ${esc(p.name)}">⟁ Ask AI</a>
    </div>
  </article>`).join("");

$("#timeline").innerHTML = profile.experience.map((e) => `
  <div class="t-item reveal">
    <h3>${esc(e.role)}</h3>
    <div class="t-meta">${esc(e.org)} · ${esc(e.period)}</div>
    <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
  </div>`).join("");

const certColor = { Microsoft: "linear-gradient(135deg,#00a4ef,#7fba00)", Boomi: "linear-gradient(135deg,#00f0ff,#2563eb)", Pluralsight: "linear-gradient(135deg,#ff3df2,#f97316)" };
$("#certs-list").innerHTML = profile.certifications.map(([n, org, y]) => `
  <div class="glass cert reveal">
    <span class="c-ico" style="background:${certColor[org] || "var(--grad)"}">${esc(org.slice(0, 2).toUpperCase())}</span>
    <div><b>${esc(n)}</b><small>${esc(org)} · ${esc(y)}</small></div>
  </div>`).join("");
$("#strengths").innerHTML = profile.strengths.map((s) => `<span class="chip">${esc(s)}</span>`).join("");

$("#copy-email").textContent = profile.email;
$("#socials").innerHTML = [
  ["GitHub", profile.github], ["LinkedIn", profile.linkedin], ["Email", "mailto:" + profile.email],
].filter(([, u]) => u).map(([n, u]) => `<a class="btn ghost small" href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join("");
$("#year").textContent = new Date().getFullYear();

/* ── Typed roles ───────────────────────────── */
(function typer() {
  const el = $("#typed"); let r = 0, i = 0, del = false;
  function tick() {
    const word = profile.roles[r];
    el.textContent = word.slice(0, i);
    if (!del && i < word.length) i++;
    else if (del && i > 0) i--;
    else if (!del) { del = true; return setTimeout(tick, 1600); }
    else { del = false; r = (r + 1) % profile.roles.length; }
    setTimeout(tick, del ? 35 : 70);
  }
  tick();
})();

/* ── Clock (SAST) ──────────────────────────── */
setInterval(() => {
  $("#clock").textContent = new Date().toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg", hour12: false }) + " SAST";
}, 1000);

/* ── Reveal on scroll + skill bars + nav highlight ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$(".bar i", e.target).forEach((b) => (b.style.width = b.dataset.w + "%"));
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$(".reveal, .section-head, .about-grid, .match-grid, .contact-grid").forEach((el) => { el.classList.add("reveal"); io.observe(el); });

const navLinks = $$(".nav-links a");
const secIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("section[id]").forEach((s) => secIO.observe(s));

$("#menu-btn").addEventListener("click", (e) => { e.currentTarget.classList.toggle("open"); $("#nav-links").classList.toggle("open"); });
navLinks.forEach((a) => a.addEventListener("click", () => { $("#menu-btn").classList.remove("open"); $("#nav-links").classList.remove("open"); }));

/* ── 3D tilt ───────────────────────────────── */
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest?.(".tilt");
    $$(".tilt").forEach((el) => { if (el !== t) el.style.transform = ""; });
    if (!t) return;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    t.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
  });
}

/* ── Toast ─────────────────────────────────── */
let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ── AI status chip ────────────────────────── */
const chip = $("#ai-chip");
AI.onState((s) => {
  const label = s.llm === "ready" ? "AI · LLM online" : s.embed === "ready" ? "AI online" : s.embed === "loading" ? "AI loading…" : s.embed === "fallback" ? "AI lite" : "AI idle";
  chip.className = "ai-chip " + (s.embed === "ready" || s.llm === "ready" ? "ready" : s.embed === "loading" || s.llm === "loading" ? "loading" : "");
  chip.querySelector("b").textContent = label;
  $("#ss-badge").classList.toggle("on", s.embed === "ready");
  $("#ss-badge").textContent = s.embed === "ready" ? "AI SEARCH · ON" : "AI SEARCH";

  const prog = $("#ai-progress");
  if (s.llm === "loading") {
    prog.hidden = false;
    prog.querySelector("i").style.width = Math.round(s.llmProgress * 100) + "%";
    prog.querySelector("span").textContent = s.llmText || "Loading model…";
  } else prog.hidden = true;

  const info = $("#boost-info"), tog = $("#boost-toggle");
  if (s.llm === "unsupported") { tog.disabled = true; tog.checked = false; info.textContent = "Needs WebGPU (Chrome/Edge desktop). Retrieval AI is still active."; }
  else if (s.llm === "ready") info.textContent = "LLM running locally on your GPU (Qwen 2.5 · 0.5B)";
  else if (s.llm === "error") { tog.checked = false; info.textContent = "Couldn't load the LLM on this device. Using retrieval AI."; }
  $("#ai-sub").textContent = s.llm === "ready" ? "Neural twin · LLM + RAG · on-device" : s.embed === "ready" ? "Neural twin · semantic RAG · on-device" : "Neural twin · in-browser";
});

// Warm up the embedding model once the page is idle (≈25 MB, cached afterwards).
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => AI.initEmbeddings());

/* ── Semantic project search ───────────────── */
let searchT;
$("#project-search").addEventListener("input", (e) => {
  clearTimeout(searchT);
  const q = e.target.value.trim();
  searchT = setTimeout(() => runSearch(q), 260);
});
async function runSearch(q) {
  const cards = $$(".project", grid);
  if (!q) {
    cards.forEach((c) => { c.style.order = ""; c.classList.remove("scored", "dim"); });
    return;
  }
  const docs = profile.projects.map((p) => `${p.name}. ${p.tag}. ${p.description} ${p.tech.join(" ")}`);
  const scores = await AI.scoreTexts(q, docs);
  const ranked = scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]);
  const top = ranked[0][0] || 1;
  ranked.forEach(([s, i], rank) => {
    const c = cards[i];
    c.style.order = rank;
    c.classList.add("scored");
    const pct = Math.max(0, Math.round((AI.state.embed === "ready" ? Math.min(1, Math.max(0, (s - 0.05) / 0.55)) : s / top) * 100));
    c.querySelector(".p-score").textContent = pct + "% match";
    c.classList.toggle("dim", pct < 25);
  });
}

/* ── Job match analyzer ────────────────────── */
$("#jd-sample").addEventListener("click", () => {
  $("#jd").value = `We're hiring an AI Automation Engineer to join our digital transformation team.
• 3+ years of experience building production software with C# and .NET
• Hands-on experience with Microsoft Power Automate and Copilot Studio
• Experience building LLM-powered agents and generative AI solutions
• Intelligent document processing and data extraction from invoices and shipping documents
• Integrating REST APIs and enterprise systems such as Dataverse and SharePoint
• Azure cloud certification preferred
• Experience with Kubernetes and Terraform
• Strong stakeholder engagement and business process analysis skills`;
});
$("#jd-run").addEventListener("click", async () => {
  const jd = $("#jd").value.trim();
  const out = $("#match-output");
  if (jd.length < 30) { toast("Paste a longer job description first"); return; }
  const btn = $("#jd-run"); btn.disabled = true; btn.textContent = "Analyzing…";
  out.innerHTML = `<div class="match-empty mono">${AI.state.embed === "ready" ? "EMBEDDING REQUIREMENTS" : "LOADING NEURAL MODEL"}<span class="caret">_</span></div>`;
  try {
    const r = await AI.analyzeJob(jd);
    if (!r) { out.innerHTML = `<div class="match-empty mono">NO REQUIREMENTS FOUND</div>`; return; }
    const C = 2 * Math.PI * 52, off = C * (1 - r.fit / 100);
    const col = r.fit >= 75 ? "var(--lime)" : r.fit >= 50 ? "var(--amber)" : "var(--magenta)";
    const verdict = r.fit >= 75 ? "Strong fit, let's talk." : r.fit >= 50 ? "Solid fit with room to grow." : "Partial fit.";
    out.innerHTML = `
      <div class="gauge">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)" id="g-arc"/>
          <text x="60" y="68" text-anchor="middle" font-family="Orbitron" font-size="24" fill="#fff">${r.fit}%</text></svg>
        <div><div class="g-val">${verdict}</div><div class="g-label">${r.rows.length} requirements analysed · ${r.mode} matching · on-device</div>
          <button class="btn ghost small" style="margin-top:.7rem" id="jd-contact">Contact Xola about this role →</button></div>
      </div>
      ${r.rows.map((x) => `<div class="req"><div class="r-head"><span class="r-badge ${x.level}">${x.level.toUpperCase()}</span><span>${esc(x.req)}</span></div>
        ${x.level !== "gap" ? `<p class="r-evidence">↳ ${esc(x.evidence)}: ${esc(x.snippet)}…</p>` : `<p class="r-evidence">↳ No direct evidence in my profile yet. Happy to discuss.</p>`}</div>`).join("")}`;
    requestAnimationFrame(() => requestAnimationFrame(() => ($("#g-arc").style.strokeDashoffset = off)));
    $("#jd-contact").addEventListener("click", () => {
      const f = $("#contact-form");
      f.subject.value = "Role opportunity: " + jd.split("\n")[0].slice(0, 80);
      f.message.value = `Hi Xola,\n\nYour portfolio's Job Match Analyzer scored you ${r.fit}% for a role we're hiring for. I'd love to chat.\n\n`;
      document.getElementById("contact").scrollIntoView();
    });
  } finally { btn.disabled = false; btn.textContent = "Analyze fit ⟶"; }
});

/* ── Contact ───────────────────────────────── */
$("#copy-email").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(profile.email); toast("Email copied to clipboard ✓"); }
  catch { location.href = "mailto:" + profile.email; }
});
$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const subject = encodeURIComponent(f.subject.value);
  const body = encodeURIComponent(`${f.message.value}\n\n— ${f.name.value}`);
  location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  toast("Opening your email app…");
});

/* ── AI twin chat ──────────────────────────── */
const panel = $("#ai-panel"), log = $("#ai-log"), input = $("#ai-text"), launcher = $("#ai-launcher");
const SUGGEST = ["What AI agents have you built?", "Tell me about the SOP Control Tower", "What certifications do you have?", "How many years of experience?", "How can I contact you?", "How does this AI work?", "Play Induku"];
$("#ai-suggest").innerHTML = SUGGEST.map((s) => `<button type="button">${esc(s)}</button>`).join("");
$("#ai-suggest").addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") send(e.target.textContent); });

let greeted = false;
function openPanel(prefill) {
  panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); launcher.classList.add("hide");
  AI.initEmbeddings();
  if (!greeted) {
    greeted = true;
    addMsg("bot", `Molo! I'm **XOLA.AI**, Xola's neural twin. I run 100% in your browser: no server, no API key, and your questions stay on your device.\n\nAsk me anything about his work, skills or experience.`);
  }
  if (prefill) send(prefill); else setTimeout(() => input.focus(), 200);
}
function closePanel() { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); launcher.classList.remove("hide"); }
launcher.addEventListener("click", () => openPanel());
$("#cta-ai").addEventListener("click", () => openPanel());
$("#ai-close").addEventListener("click", closePanel);
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-ask]");
  if (a) { e.preventDefault(); openPanel(a.dataset.ask); }
});

function addMsg(who, html, raw = false) {
  const m = document.createElement("div");
  m.className = "msg " + who;
  m.innerHTML = raw ? html : md(html);
  log.appendChild(m); log.scrollTop = log.scrollHeight;
  return m;
}

function runAction(a) {
  if (!a) return;
  if (a.type === "scroll") { const el = document.getElementById(a.target); if (el) { el.scrollIntoView(); if (innerWidth < 560) closePanel(); } }
  if (a.type === "open") window.open(a.target, "_blank", "noopener");
}

let busy = false;
async function send(text) {
  text = (text || "").trim();
  if (!text || busy) return;
  busy = true;
  input.value = "";
  addMsg("user", text);
  const m = addMsg("bot", `<span class="typing"><i></i><i></i><i></i></span>`, true);
  $(".ai-id .orb").classList.add("thinking");
  try {
    const useLLM = $("#boost-toggle").checked;
    const res = await AI.ask(text, {
      useLLM,
      onToken: (t) => { m.innerHTML = md(t); log.scrollTop = log.scrollHeight; },
    });
    let html = md(res.text);
    const modeLabel = { llm: "LLM + RAG", rag: "semantic RAG", lexical: "keyword", intent: "command" }[res.mode] || "";
    if (res.sources?.length) html += `<span class="src">◈ ${modeLabel} · ${res.sources.map((s) => esc(s.title)).join(" · ")}</span>`;
    if (res.link) html += `<a class="act" href="${res.link}" target="_blank" rel="noopener">Open ↗</a>`;
    if (res.action?.label) html += `<button class="act" data-act='${esc(JSON.stringify(res.action))}'>${esc(res.action.label)} →</button>`;
    m.innerHTML = html;
    if (res.action && !res.action.label) runAction(res.action);
    speak(res.text);
  } catch (err) {
    console.error(err);
    m.textContent = "My circuits glitched. Please try again, or email " + profile.email + ".";
  } finally {
    busy = false;
    $(".ai-id .orb").classList.remove("thinking");
    log.scrollTop = log.scrollHeight;
  }
}
log.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (b) runAction(JSON.parse(b.dataset.act));
});
$("#ai-form").addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });

$("#boost-toggle").addEventListener("change", async (e) => {
  if (!e.target.checked) return;
  addMsg("bot", "⚡ Engaging Neural Boost: downloading a small LLM to run on your GPU. This happens once and is cached for next time.");
  const ok = await AI.initLLM();
  if (ok) addMsg("bot", "Neural Boost online. I'm now generating answers with an on-device LLM, grounded in Xola's real profile.");
  else { e.target.checked = false; addMsg("bot", "Neural Boost couldn't start on this device, so I'll keep using semantic retrieval. Answers are still accurate."); }
});

/* ── Voice in / out (Web Speech API) ───────── */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = $("#mic-btn");
if (!SR) mic.hidden = true;
else {
  const rec = new SR(); rec.lang = "en-ZA"; rec.interimResults = true;
  let listening = false;
  rec.onresult = (e) => {
    const t = [...e.results].map((r) => r[0].transcript).join("");
    input.value = t;
    if (e.results[e.results.length - 1].isFinal) send(t);
  };
  rec.onend = () => { listening = false; mic.classList.remove("rec"); };
  rec.onerror = () => { listening = false; mic.classList.remove("rec"); toast("Voice input unavailable"); };
  mic.addEventListener("click", () => {
    if (listening) return rec.stop();
    try { rec.start(); listening = true; mic.classList.add("rec"); } catch {}
  });
}
const tts = $("#tts-toggle");
if (!("speechSynthesis" in window)) tts.hidden = true;
tts.addEventListener("click", () => {
  const on = tts.getAttribute("aria-pressed") !== "true";
  tts.setAttribute("aria-pressed", on); tts.textContent = on ? "🔊" : "🔈";
  if (!on) speechSynthesis.cancel();
  toast(on ? "Voice replies on" : "Voice replies off");
});
function speak(text) {
  if (tts.getAttribute("aria-pressed") !== "true") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/[•→⟶↗]/g, ""));
  const v = speechSynthesis.getVoices().find((v) => /en-(ZA|GB)/.test(v.lang)) || null;
  if (v) u.voice = v;
  u.rate = 1.03; u.pitch = 0.95;
  speechSynthesis.speak(u);
}

/* ── Command palette (Ctrl/⌘ + K) ──────────── */
const pal = $("#palette"), pin = $("#palette-input"), plist = $("#palette-list");
const COMMANDS = [
  ["Ask the AI twin", "AI", () => openPanel()],
  ["Go to About", "NAV", () => location.hash = "#about"],
  ["Go to Skills", "NAV", () => location.hash = "#skills"],
  ["Go to Projects", "NAV", () => location.hash = "#projects"],
  ["Analyze a job description", "AI", () => { location.hash = "#match"; setTimeout(() => $("#jd").focus(), 400); }],
  ["Go to Journey", "NAV", () => location.hash = "#experience"],
  ["Go to Credentials", "NAV", () => location.hash = "#certs"],
  ["Contact Xola", "NAV", () => location.hash = "#contact"],
  ["Copy email address", "ACTION", () => $("#copy-email").click()],
  ["Open GitHub", "LINK", () => window.open(profile.github, "_blank", "noopener")],
  ["Open LinkedIn", "LINK", () => window.open(profile.linkedin, "_blank", "noopener")],
  ["Play Induku", "LINK", () => window.open("https://xola-twayise.github.io/Induku/", "_blank", "noopener")],
  ["Enable Neural Boost (on-device LLM)", "AI", () => { openPanel(); const t = $("#boost-toggle"); if (!t.checked && !t.disabled) { t.checked = true; t.dispatchEvent(new Event("change")); } }],
];
let sel = 0, filtered = COMMANDS;
function renderPalette() {
  const q = pin.value.toLowerCase().trim();
  filtered = COMMANDS.filter(([n]) => n.toLowerCase().includes(q));
  const items = filtered.map(([n, k], i) => `<li data-i="${i}" class="${i === sel ? "sel" : ""}"><span>${esc(n)}</span><small>${k}</small></li>`);
  if (q) items.push(`<li data-i="ask" class="${sel === filtered.length ? "sel" : ""}"><span>Ask AI: “${esc(pin.value)}”</span><small>AI</small></li>`);
  plist.innerHTML = items.join("");
}
function openPalette() { pal.hidden = false; pin.value = ""; sel = 0; renderPalette(); pin.focus(); }
function closePalette() { pal.hidden = true; }
function runPalette(i) {
  closePalette();
  if (i === "ask" || i >= filtered.length) return openPanel(pin.value);
  filtered[i][2]();
}
$("#open-palette").addEventListener("click", openPalette);
pin.addEventListener("input", () => { sel = 0; renderPalette(); });
pin.addEventListener("keydown", (e) => {
  const max = filtered.length + (pin.value.trim() ? 1 : 0) - 1;
  if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(max, sel + 1); renderPalette(); }
  if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); renderPalette(); }
  if (e.key === "Enter") { e.preventDefault(); if (max >= 0) runPalette(sel); }
});
plist.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) runPalette(li.dataset.i === "ask" ? "ask" : +li.dataset.i); });
pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); }
  if (e.key === "Escape") { if (!pal.hidden) closePalette(); else if (panel.classList.contains("open")) closePanel(); }
});

/* ── Konami easter egg ─────────────────────── */
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let kpos = 0;
document.addEventListener("keydown", (e) => {
  kpos = e.key === KONAMI[kpos] ? kpos + 1 : 0;
  if (kpos === KONAMI.length) { kpos = 0; document.body.style.filter = document.body.style.filter ? "" : "hue-rotate(120deg)"; toast("🕹 Cheat code accepted: palette shifted"); }
});
