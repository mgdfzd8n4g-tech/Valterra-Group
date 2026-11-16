# Valterra Group — Official Enterprise Website & Gemini AI Integration

The official enterprise digital platform for **Valterra Group**, an elite technology and digital solutions agency operating across South Africa (Johannesburg, Cape Town) and international hubs (London, Zurich).

---

## 🏛️ Brand & Architectural Identity

* **Theme**: Dark, minimalist luxury (Deep Obsidian `#070709`, Elevated Panel Charcoal `#0D0D12`, Champagne Titanium accents `#D8C9A3`).
* **Typography**: Geometric architectural headings (*Syne*) + utilitarian body (*Plus Jakarta Sans*) + technical mono (*JetBrains Mono*).
* **Speed & Performance**: Engineered with zero bloat for instant global delivery across Cloudflare's 300+ city edge network.

---

## 🌐 The Four Group Divisions

1. **Valterra Digital** — Bespoke website engineering, mission-critical web applications, headless e-commerce, and cloud architectures.
2. **Valterra Marketing** — Performance client acquisition, algorithmic SEO, content distribution systems, and corporate branding.
3. **Valterra AI** — Autonomous agentic workflows, custom LLM systems, intelligent document processing, and predictive telemetry.
4. **Valterra Consulting** — Digital transformation roadmaps, enterprise architecture audits, cloud migration, and IT risk governance.

---

## 🤖 Flagship Feature: Valterra Strategic AI Scoper

Embedded directly on the homepage, the **Strategic AI Scoper** showcases Valterra's artificial intelligence capabilities:
* Prospects select their industry and input their primary operational bottleneck.
* The system invokes Google Gemini (`gemini-4-hydrogen` or `gemini-3.5-flash-lite`) via Cloudflare Pages Edge Functions (`/functions/api/scoper.js`).
* Generates an executive diagnostic, multi-division solution blueprint, 3-phase roadmap, and projected ROI metric.
* Includes a one-click transfer that auto-populates the executive inquiry brief.

---

## 🚀 Cloudflare Pages Deployment

### Option A: Cloudflare Dashboard (Recommended)
1. Push this repository to GitHub or GitLab.
2. In Cloudflare Dashboard, navigate to **Compute (Workers) > Pages > Connect to Git**.
3. Select your repository:
   * **Framework preset**: `None` (Static HTML / Cloudflare Pages)
   * **Build output directory**: `.`
4. In **Settings > Environment variables**, add your secret:
   * `GEMINI_API_KEY` = `your_google_gemini_api_key`
5. Click **Save and Deploy**. Cloudflare automatically compiles the edge function (`/functions/api/scoper.js`) and distributes the site globally.

### Option B: Cloudflare Wrangler CLI
```bash
# Login to Cloudflare
npx wrangler login

# Deploy project
npx wrangler pages deploy . --project-name=valterra-group

# Set Gemini API Key secret
npx wrangler pages secret put GEMINI_API_KEY --project-name=valterra-group
```

---

## 💻 Local Preview & Testing

To test the website locally:

```bash
# Using Ruby's built-in web server (pre-installed on macOS):
ruby -run -e httpd . -p 3000

# Or using Cloudflare Wrangler for full local edge function emulation:
npx wrangler pages dev .
```

Then navigate to `http://localhost:3000` in your browser.
