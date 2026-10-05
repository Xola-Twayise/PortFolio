// ─────────────────────────────────────────────────────────────
//  In-browser AI engine. No server, no API keys, $0.
//   • Retrieval: all-MiniLM-L6-v2 sentence embeddings via Transformers.js
//   • Generation (optional "Neural Boost"): Qwen2.5-0.5B via WebLLM on WebGPU
//   • Fallback: lexical scoring, so the site still answers if models can't load
// ─────────────────────────────────────────────────────────────
import { profile } from "./profile.js";

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";
const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm";
const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2";
const LLM_MODEL = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

const listeners = new Set();
export const state = { embed: "idle", llm: "idle", llmProgress: 0, llmText: "" };
function emit() { listeners.forEach((fn) => fn(state)); }
export function onState(fn) { listeners.add(fn); fn(state); }

// ── Knowledge base built from profile.js ──────────────────────
// Each chunk: { id, kind, title, text (embedded), answer (shown), section, ref }
export const kb = buildKB();

function buildKB() {
  const p = profile;
  const chunks = [];
  const add = (c) => chunks.push({ id: chunks.length, ...c });

  add({ kind: "summary", title: "Summary", section: "about",
    text: `Who is ${p.name}? ${p.title}. ${p.summary}`,
    answer: `I'm ${p.name}, ${articleFor(p.title)} ${p.title} based in ${p.location}. ${p.summary}` });

  p.about.forEach((t, i) => add({ kind: "about", title: "About", section: "about", text: t, answer: t, ref: i }));

  p.skills.forEach((g) => {
    const list = g.items.map(([n]) => n).join(", ");
    add({ kind: "skills", title: `Skills · ${g.group}`, section: "skills",
      text: `${g.group} skills and technologies: ${list}`,
      answer: `In ${g.group}, I work with ${list}. The strongest of these is ${g.items.slice().sort((a, b) => b[1] - a[1])[0][0]}.` });
  });

  p.projects.forEach((pr, i) => add({ kind: "project", title: `Project · ${pr.name}`, section: "projects", ref: i,
    text: `${pr.name} (${pr.tag}). ${pr.description} Technologies: ${pr.tech.join(", ")}.`,
    answer: `**${pr.name}** (${pr.tag}, ${pr.year}): ${pr.description}\nBuilt with ${pr.tech.join(", ")}.`,
    link: pr.live || pr.repo }));

  p.experience.forEach((e) => add({ kind: "experience", title: `${e.role} · ${e.org}`, section: "experience",
    text: `${e.role} at ${e.org}, ${e.period}. ${e.points.join(" ")}`,
    answer: `${e.role} at ${e.org} (${e.period}):\n• ${e.points.join("\n• ")}` }));

  if (p.certifications?.length) {
    const ms = p.certifications.filter((c) => c[1] !== "Boomi").map((c) => `${c[0]} (${c[1]}, ${c[2]})`);
    const boomi = p.certifications.filter((c) => c[1] === "Boomi").map((c) => c[0]);
    add({ kind: "certs", title: "Certifications", section: "certs",
      text: `Certifications and credentials: ${p.certifications.map((c) => `${c[0]} ${c[1]}`).join(", ")}. Azure, Boomi, Pluralsight.`,
      answer: `My certifications: ${ms.join("; ")}${boomi.length ? `, plus ${boomi.length} Boomi certifications (${boomi.join(", ")}).` : "."}` });
  }
  if (p.strengths?.length) add({ kind: "strengths", title: "Strengths", section: "certs",
    text: `Soft skills and strengths: ${p.strengths.join(", ")}`, answer: `Beyond the code, my strengths are ${p.strengths.join(", ").toLowerCase()}.` });

  p.faq.forEach((f) => add({ kind: "faq", title: "FAQ", section: null, text: `${f.q} ${f.a}`, q: f.q, answer: f.a }));
  return chunks;
}
function articleFor(w) { return /^[aeiou]/i.test(w) ? "an" : "a"; }

// ── Embeddings ────────────────────────────────────────────────
let extractor = null;
let kbVecs = null;
let embedPromise = null;

export function initEmbeddings() {
  if (embedPromise) return embedPromise;
  state.embed = "loading"; emit();
  embedPromise = (async () => {
    const tf = await import(/* @vite-ignore */ TRANSFORMERS_URL);
    tf.env.allowLocalModels = false;
    extractor = await tf.pipeline("feature-extraction", EMBED_MODEL, { dtype: "q8" });
    kbVecs = await embed(kb.map((c) => c.text));
    state.embed = "ready"; emit();
    return true;
  })().catch((err) => {
    console.warn("[ai] embeddings unavailable, using lexical fallback:", err);
    state.embed = "fallback"; emit();
    return false;
  });
  return embedPromise;
}

async function embed(texts) {
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  return out.tolist();
}
const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

// ── Lexical fallback ──────────────────────────────────────────
const STOP = new Set("a an and are as at be by do does for from has have how i in is it me my of on or so tell that the this to was what when where which who why will with you your about can any".split(" "));
const tokens = (s) => s.toLowerCase().replace(/[^a-z0-9#+.\s-]/g, " ").split(/\s+/).map((w) => w.replace(/(ing|ed|es|s)$/, "")).filter((w) => w.length > 1 && !STOP.has(w));
const kbTokens = kb.map((c) => new Set(tokens(c.text)));
function lexicalScores(query) {
  const q = tokens(query);
  if (!q.length) return kb.map(() => 0);
  return kbTokens.map((set) => {
    let hit = 0; q.forEach((t) => { if (set.has(t)) hit++; });
    return hit / (q.length + 2);
  });
}

// ── Retrieval API ─────────────────────────────────────────────
export async function scoreTexts(query, docs) {
  // Similarity of query to arbitrary doc strings (used for project search).
  if (state.embed === "ready") {
    const [qv, ...dv] = await embed([query, ...docs]);
    return dv.map((v) => dot(qv, v));
  }
  const q = tokens(query);
  return docs.map((d) => { const s = new Set(tokens(d)); let h = 0; q.forEach((t) => s.has(t) && h++); return q.length ? h / q.length : 0; });
}

export async function retrieve(query, k = 4) {
  let scores;
  if (state.embed === "ready") {
    const [qv] = await embed([query]);
    scores = kbVecs.map((v) => dot(qv, v));
    // small lexical boost for exact keyword matches (names, tech)
    const lex = lexicalScores(query);
    scores = scores.map((s, i) => s + lex[i] * 0.25);
  } else {
    scores = lexicalScores(query);
  }
  return kb.map((c, i) => ({ ...c, score: scores[i] }))
    .sort((a, b) => b.score - a.score).slice(0, k);
}

// ── Intent layer: navigation & small talk ─────────────────────
const SECTIONS = { about: "about", bio: "about", skill: "skills", stack: "skills", project: "projects", work: "projects", portfolio: "projects", experience: "experience", journey: "experience", career: "experience", cert: "certs", credential: "certs", contact: "contact", email: "contact", hire: "contact", "job match": "match", analyzer: "match" };

function detectIntent(q) {
  const s = q.toLowerCase().trim();
  if (/^(hi|hello|hey|yo|howzit|molo|sawubona|good (morning|afternoon|evening))\b/.test(s) && s.split(" ").length <= 4)
    return { reply: `Molo! 👋 I'm Xola's AI twin, and I run entirely in your browser. Ask me about his AI agents, automation work, skills, certifications, or how to get in touch.` };
  if (/^(thanks|thank you|enkosi|cool|nice|awesome)\b/.test(s))
    return { reply: "Enkosi! Anything else you'd like to know?" };
  const nav = s.match(/\b(go to|show|open|take me to|scroll to|navigate to)\b\s+(?:the\s+|your\s+|me\s+)?(.+)/);
  if (nav) {
    const key = Object.keys(SECTIONS).find((k) => nav[2].includes(k));
    if (key) return { reply: `Taking you to ${SECTIONS[key]} →`, action: { type: "scroll", target: SECTIONS[key] } };
  }
  if (/\b(play|launch)\b.*\binduku\b/.test(s))
    return { reply: "Launching Induku in a new tab. Ukulwa ngeentonga! 🥢", action: { type: "open", target: "https://xola-twayise.github.io/Induku/" } };
  if (/\b(phone|cell|number|whatsapp)\b/.test(s))
    return { reply: `Xola doesn't publish a phone number here. The best way to reach him is ${profile.email} or LinkedIn, and he'll share contact details from there.`, action: { type: "scroll", target: "contact", label: "Open contact" } };
  return null;
}

// ── Answer composition (no LLM) ───────────────────────────────
const allText = kb.map((c) => c.text.toLowerCase()).join(" ");
function unknownSkill(query) {
  // "Do you know X?" / "experience with X" where X never appears in the profile → answer honestly.
  const m = query.toLowerCase().match(/\b(?:know|use|used|experience (?:with|in)|good (?:at|with)|familiar with|work with|worked with|skilled in)\s+([a-z0-9#+.\- ]{2,30})\??$/);
  if (!m) return null;
  const term = m[1].replace(/\b(the|a|an)\b/g, "").trim();
  const words = term.split(/\s+/).filter((w) => w.length > 1);
  if (!words.length || words.some((w) => allText.includes(w))) return null;
  return term;
}

function compose(query, hits) {
  const top = hits[0];
  const threshold = state.embed === "ready" ? 0.3 : 0.12;
  const unknown = unknownSkill(query);
  if (unknown) {
    return {
      text: `${unknown.replace(/^\w/, (c) => c.toUpperCase())} isn't something I list in my profile, so I won't overclaim. My core strengths are AI agents and automation (Copilot Studio, Power Automate, Azure AI), C#/.NET, SQL, REST APIs and Boomi integrations. I pick up new tools quickly, so feel free to ask me directly at ${profile.email}.`,
      sources: [{ title: "Skill Matrix", section: "skills" }],
      action: { type: "scroll", target: "skills", label: "Show skills" },
    };
  }
  if (!top || top.score < threshold) {
    return {
      text: `I'm not sure I have that in my memory banks. I know about Xola's AI & automation work at JAS Worldwide, his projects, skills, certifications and how to reach him. Try "What AI agents have you built?" or "What certifications do you have?". For anything else, email ${profile.email}.`,
      sources: [],
    };
  }
  const isList = /\b(projects|built|portfolio|work on|made)\b/i.test(query) && hits.filter((h) => h.kind === "project").length >= 2 && !/\b(induku|control tower|meeting|freight|carrier|document|arrival)\b/i.test(query);
  if (isList) {
    const names = profile.projects.map((p) => `• ${p.name} (${p.tag})`).join("\n");
    return { text: `Here's what I've built:\n${names}\n\nAsk me about any of them for details.`, sources: [{ title: "Projects", section: "projects" }], action: { type: "scroll", target: "projects", label: "View projects" } };
  }
  let text = top.answer;
  const second = hits[1];
  if (second && second.kind !== top.kind && second.score > top.score - 0.06 && second.score > threshold + 0.1 && text.length < 380) {
    text += `\n\n${second.answer}`;
  }
  const res = { text, sources: hits.filter((h) => h.score >= threshold).slice(0, 3).map((h) => ({ title: h.title, section: h.section })) };
  if (top.section) res.action = { type: "scroll", target: top.section, label: `Show ${top.section}` };
  if (top.link) res.link = top.link;
  if (/hire|contact|email|reach|available/i.test(query)) res.action = { type: "scroll", target: "contact", label: "Open contact" };
  return res;
}

// ── WebLLM (Neural Boost) ─────────────────────────────────────
let engine = null;
let llmPromise = null;
export const webgpuSupported = typeof navigator !== "undefined" && !!navigator.gpu;

export function initLLM() {
  if (llmPromise) return llmPromise;
  if (!webgpuSupported) { state.llm = "unsupported"; emit(); return Promise.resolve(false); }
  state.llm = "loading"; state.llmProgress = 0; emit();
  llmPromise = (async () => {
    const webllm = await import(/* @vite-ignore */ WEBLLM_URL);
    engine = await webllm.CreateMLCEngine(LLM_MODEL, {
      initProgressCallback: (r) => { state.llmProgress = r.progress ?? 0; state.llmText = r.text ?? ""; emit(); },
    });
    state.llm = "ready"; emit();
    return true;
  })().catch((err) => {
    console.warn("[ai] WebLLM failed:", err);
    state.llm = "error"; state.llmText = String(err?.message || err).slice(0, 160); emit();
    llmPromise = null;
    return false;
  });
  return llmPromise;
}

const history = [];

async function generate(query, hits, onToken) {
  const context = hits.map((h, i) => `[${i + 1}] ${h.title}: ${h.answer.replace(/\*\*/g, "")}`).join("\n");
  const system =
    `You are XOLA.AI, the AI twin of ${profile.name}, ${articleFor(profile.title)} ${profile.title} at JAS Worldwide in ${profile.location}. ` +
    `Speak in first person as Xola: warm, confident, concise (2-5 sentences). ` +
    `Answer ONLY using the facts in CONTEXT. If the answer is not in CONTEXT, say you don't know and suggest emailing ${profile.email}. ` +
    `Never invent employers, dates, numbers or phone numbers.\n\nCONTEXT:\n${context}`;
  const messages = [{ role: "system", content: system }, ...history.slice(-4), { role: "user", content: query }];
  const stream = await engine.chat.completions.create({ messages, stream: true, temperature: 0.4, max_tokens: 320 });
  let out = "";
  for await (const chunk of stream) {
    const d = chunk.choices?.[0]?.delta?.content || "";
    if (d) { out += d; onToken(out); }
  }
  history.push({ role: "user", content: query }, { role: "assistant", content: out });
  return out.trim();
}

// ── Public ask() ──────────────────────────────────────────────
export async function ask(query, { useLLM = false, onToken } = {}) {
  const intent = detectIntent(query);
  if (intent) return { text: intent.reply, action: intent.action, sources: [], mode: "intent" };

  if (state.embed === "idle" || state.embed === "loading") await initEmbeddings();
  const hits = await retrieve(query, 4);
  const base = compose(query, hits);

  if (useLLM && state.llm === "ready" && base.sources.length) {
    try {
      const text = await generate(query, hits, onToken || (() => {}));
      return { ...base, text, mode: "llm" };
    } catch (e) { console.warn("[ai] generation failed, using retrieval answer", e); }
  }
  return { ...base, mode: state.embed === "ready" ? "rag" : "lexical" };
}

// ── Job match analyzer ────────────────────────────────────────
export async function analyzeJob(jd) {
  const reqs = jd
    .split(/\n+|(?<=[.;!?])\s+|•|·|•/)
    .map((s) => s.replace(/^[\s\-*\d.)]+/, "").trim())
    .filter((s) => s.length > 18 && /[a-z]/i.test(s))
    .slice(0, 30);
  if (!reqs.length) return null;

  if (state.embed === "idle" || state.embed === "loading") await initEmbeddings();
  const evidence = kb.filter((c) => c.kind !== "faq" || /AI|LLM|experience|certif/i.test(c.q));
  let sims;
  if (state.embed === "ready") {
    const rv = await embed(reqs);
    const evIdx = evidence.map((c) => c.id);
    sims = rv.map((v) => evIdx.map((id) => dot(v, kbVecs[id])));
  } else {
    sims = reqs.map((r) => {
      const q = tokens(r);
      return evidence.map((c) => { let h = 0; q.forEach((t) => kbTokens[c.id].has(t) && h++); return q.length ? Math.min(1, (h / q.length) * 1.4) : 0; });
    });
  }
  const [strong, partial] = state.embed === "ready" ? [0.5, 0.36] : [0.45, 0.2];
  const rows = reqs.map((r, i) => {
    const arr = sims[i];
    let bi = 0; arr.forEach((s, j) => { if (s > arr[bi]) bi = j; });
    const s = arr[bi];
    const level = s >= strong ? "strong" : s >= partial ? "partial" : "gap";
    const ev = evidence[bi];
    return { req: r, score: s, level, evidence: ev.title, snippet: ev.answer.replace(/\*\*/g, "").slice(0, 150) };
  });
  const pts = rows.reduce((t, r) => t + (r.level === "strong" ? 1 : r.level === "partial" ? 0.6 : 0.15), 0);
  const fit = Math.round((pts / rows.length) * 100);
  return { fit, rows, mode: state.embed === "ready" ? "semantic" : "keyword" };
}
