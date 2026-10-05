# Xola Twayise · AI Portfolio

A futuristic portfolio site with an **AI twin that runs entirely in the visitor's browser**. There's no backend and no API keys, and it costs nothing to host on GitHub Pages.

**Live:** https://xola-twayise.github.io/PortFolio/

## AI features

| Feature | How it works |
|---|---|
| **XOLA.AI twin** (chat) | Retrieval-augmented answers. Questions are embedded with `all-MiniLM-L6-v2` via [Transformers.js](https://github.com/huggingface/transformers.js) and matched against a knowledge base built from `js/profile.js`. |
| **Neural Boost** | Optional. Loads `Qwen2.5-0.5B-Instruct` via [WebLLM](https://github.com/mlc-ai/web-llm) on WebGPU and generates answers grounded in the retrieved facts. |
| **Job Match Analyzer** | Paste a job description. Each requirement is embedded and scored against the profile, giving a fit %, evidence and gaps. |
| **Semantic project search** | Search projects by meaning, not keywords. |
| **Voice** | Speak questions (Web Speech recognition) and hear replies (speech synthesis). |
| **Command palette** | `Ctrl/⌘ + K` for navigation, or type anything to ask the AI. |

If the models can't load (offline, blocked CDN, old browser), the AI falls back to keyword matching, so the site always answers.

## Editing content

Everything (bio, skills, projects, experience, certifications, FAQ) lives in **`js/profile.js`**. Edit it, push, and the page, the AI twin and the analyzer all update.

Photos go in `assets/` (see `assets/README.md`).

## Run locally

ES modules need a local server (opening the file directly won't work):

```bash
npx serve .
```

## Deploy

Pushing to `main` runs `.github/workflows/pages.yml`, which publishes the site to GitHub Pages. One-time setup: in the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
