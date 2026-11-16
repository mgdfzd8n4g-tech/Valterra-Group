/**
 * Valterra Group — Strategic AI Scoper
 * Interactive Gemini API Integration
 */

(function () {
  const form = document.getElementById('scoper-form');
  const industrySelect = document.getElementById('scoper-industry');
  const challengeInput = document.getElementById('scoper-challenge');
  const ambitionInput = document.getElementById('scoper-ambition');
  const divisionSelect = document.getElementById('scoper-division');
  const submitBtn = document.getElementById('scoper-submit-btn');
  const outputConsole = document.getElementById('scoper-output');
  const actionRow = document.getElementById('scoper-actions');
  const copyBtn = document.getElementById('scoper-copy-btn');
  const transferBtn = document.getElementById('scoper-transfer-btn');
  const apiKeyModal = document.getElementById('api-key-modal');
  const apiKeyInput = document.getElementById('custom-api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const skipKeyBtn = document.getElementById('skip-key-btn');

  let currentGeneratedScope = '';
  let storedApiKey = sessionStorage.getItem('valterra_gemini_key') || '';

  // Preset triggers when industry changes
  const industryPresets = {
    'FinTech & Banking': {
      challenge: 'Legacy core banking bottlenecks and high reconciliation latency across cross-border African settlement corridors.',
      ambition: 'Sub-second real-time payments, automated regulatory reporting, and AI AML verification.'
    },
    'Mining & Natural Resources': {
      challenge: 'Disparate telemetry data across remote mining pits leading to reactive maintenance downtime and ESG audit compliance lag.',
      ambition: 'Autonomous predictive haulage dispatch, centralized ESG telemetry dashboard, and private satellite edge sync.'
    },
    'Luxury & Global Retail': {
      challenge: 'Fragmented omnichannel customer profiles and high cart abandonment in international luxury flagship digital storefronts.',
      ambition: 'Headless composable commerce platform with AI concierge styling and VIP clienteling automation.'
    },
    'Healthcare & Diagnostics': {
      challenge: 'Clinical lab reporting silos and manual patient triage creating scheduling backlogs and compliance friction.',
      ambition: 'HIPAA/POPIA compliant diagnostic workflow automation and patient engagement AI pipeline.'
    },
    'Enterprise Logistics & Supply Chain': {
      challenge: 'Lack of end-to-end multi-modal container visibility and manual bill of lading processing.',
      ambition: 'Automated OCR document extraction, dynamic route pricing algorithms, and predictive port congestion alerts.'
    }
  };

  if (industrySelect) {
    industrySelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (industryPresets[selected] && !challengeInput.value) {
        challengeInput.value = industryPresets[selected].challenge;
        ambitionInput.value = industryPresets[selected].ambition;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const industry = industrySelect.value;
      const challenge = challengeInput.value.trim();
      const ambition = ambitionInput.value.trim();
      const division = divisionSelect.value;

      if (!industry || !challenge) {
        alert('Please select an industry and describe your business challenge.');
        return;
      }

      setLoadingState(true);
      outputConsole.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; color: #D8C9A3; font-family: var(--font-mono);">
          <span class="pulse-dot" style="background-color: #D8C9A3; box-shadow: 0 0 10px #D8C9A3;"></span>
          <span>Synthesizing cross-division architectural strategy with Gemini 4 Hydrogen...</span>
        </div>
      `;

      try {
        let resultMarkdown = '';

        // Attempt 1: Call Cloudflare Pages Edge Function (/api/scoper)
        const edgeHeaders = { 'Content-Type': 'application/json' };
        if (storedApiKey) edgeHeaders['x-gemini-key'] = storedApiKey;

        const response = await fetch('/api/scoper', {
          method: 'POST',
          headers: edgeHeaders,
          body: JSON.stringify({ industry, challenge, ambition, divisionFocus: division })
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          resultMarkdown = data.scope;
        } else if (response && response.status === 401 && !storedApiKey) {
          // Open API Key input modal or offer high-fidelity interactive simulation
          const chosenKey = await promptApiKeyModal();
          if (chosenKey) {
            storedApiKey = chosenKey;
            sessionStorage.setItem('valterra_gemini_key', chosenKey);
            // Re-invoke with user's key
            resultMarkdown = await directGeminiFetch(chosenKey, industry, challenge, ambition, division);
          } else {
            // Simulated high-fidelity strategic brief
            resultMarkdown = generateSimulatedScope(industry, challenge, ambition, division);
          }
        } else if (storedApiKey) {
          // Direct client call with key
          resultMarkdown = await directGeminiFetch(storedApiKey, industry, challenge, ambition, division);
        } else {
          // Edge function unavailable or offline local preview: generate executive simulation
          resultMarkdown = generateSimulatedScope(industry, challenge, ambition, division);
        }

        currentGeneratedScope = resultMarkdown;
        await streamMarkdownToConsole(resultMarkdown, outputConsole);
        actionRow.style.display = 'flex';
      } catch (err) {
        console.error('Scoper Error:', err);
        outputConsole.innerHTML = `
          <div style="color: #ef4444; font-family: var(--font-mono); font-size: 0.85rem;">
            [Execution Error]: ${err.message || 'Unable to complete AI transformation synthesis.'}
          </div>
        `;
      } finally {
        setLoadingState(false);
      }
    });
  }

  // Direct fetch to Gemini API
  async function directGeminiFetch(key, industry, challenge, ambition, division) {
    const systemPrompt = `You are the Lead Digital Solutions Architect & Partner at Valterra Group, a premier international digital solutions, engineering, and AI agency.
Divisions: Valterra Digital (Platform Engineering), Valterra Marketing (Brand & Growth), Valterra AI (Agentic Workflows), Valterra Consulting (Enterprise Transformation).
Produce an authoritative, executive-ready Strategic Transformation Brief in structured Markdown with:
### 1. Executive Diagnostic & Market Context
### 2. Multi-Division Architectural Solution (Valterra Digital, Valterra Marketing, Valterra AI, Valterra Consulting)
### 3. Three-Phase Execution Roadmap (Weeks 1-4, Weeks 5-12, Weeks 13+)
### 4. Projected Strategic Impact & ROI Metric`;

    const userPrompt = `Client Sector: ${industry}\nOperational Challenge: ${challenge}\nStrategic Ambition: ${ambition}\nDivision Focus: ${division}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.35, maxOutputTokens: 2000 }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  }

  // High-fidelity fallback / offline executive simulation
  function generateSimulatedScope(industry, challenge, ambition, division) {
    return `### 1. Executive Diagnostic & Market Context
Operating within **${industry}**, current architectural vulnerabilities stem directly from **"${challenge}"**. In an increasingly sovereign and high-velocity digital economy, traditional patchwork solutions incur compounded technical debt, latency friction, and elevated operational overhead. 

Addressing your target milestone of **"${ambition}"** necessitates a consolidated multi-division intervention spearheaded by **${division || 'Valterra Group Unified Practice'}**.

---

### 2. Multi-Division Architectural Solution
- **Valterra Digital:** Deployment of an edge-rendered headless platform utilizing Astro/TypeScript, globally distributed across Cloudflare Tier-4 points of presence with sub-50ms TTFB across South Africa and European corridors.
- **Valterra Marketing:** Strategic institutional repositioning emphasizing algorithmic trust, high-intent enterprise search dominance, and conversion architecture engineered for multi-million-rand pipeline velocity.
- **Valterra AI:** Embedded autonomous pipeline running sovereign LLM agents for predictive telemetry, automated document parsing, and real-time operational anomaly detection.
- **Valterra Consulting:** Comprehensive ISO 27001 / POPIA data sovereignty audit, cloud modernization blueprint, and executive change-management playbooks.

---

### 3. Three-Phase Execution Roadmap
- **Phase 1: Foundation & Discovery (Weeks 1–4):** Architecture audit, API contract definitions, baseline data pipeline stabilization, and design system governance.
- **Phase 2: Core Engineering & AI Orchestration (Weeks 5–12):** Deployment of edge application tier, sovereign AI workflow integrations, and sandbox compliance testing.
- **Phase 3: Scale, Optimization & Market Dominance (Weeks 13+):** Global CDN routing rollout, continuous automated testing, performance indexing, and executive telemetry handoff.

---

### 4. Projected Strategic Impact & ROI Metric
- **78% Reduction** in operational process cycle time.
- **99.98% High-Availability SLA** backed by Cloudflare global edge resilience.
- **Direct ROI Payback Period** modeled at 4.2 to 5.5 months post-commissioning.`;
  }

  // Stream markdown text with typewriter feel
  async function streamMarkdownToConsole(markdown, container) {
    container.innerHTML = '';
    const formattedHtml = parseMarkdown(markdown);
    
    // Smooth reveal
    container.innerHTML = `<div class="scope-result-content" style="opacity: 0; transition: opacity 0.5s ease;">${formattedHtml}</div>`;
    setTimeout(() => {
      const el = container.querySelector('.scope-result-content');
      if (el) el.style.opacity = '1';
    }, 50);
  }

  // Simple clean markdown parser for executive brief
  function parseMarkdown(md) {
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/---/gim, '<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.5rem 0;">')
      .replace(/\n\n/gim, '<p style="margin-bottom: 0.85rem;"></p>');

    // Wrap consecutive li in ul
    html = html.replace(/(<li>.*?<\/li>)+/gims, '<ul>$&</ul>');
    return html;
  }

  function setLoadingState(isLoading) {
    if (submitBtn) {
      submitBtn.disabled = isLoading;
      submitBtn.innerHTML = isLoading
        ? `<span class="pulse-dot"></span> Synthesizing Strategy...`
        : `<span>Synthesize Transformation Brief</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    }
  }

  // Transfer Scope to Contact Form
  if (transferBtn) {
    transferBtn.addEventListener('click', () => {
      const contactMessage = document.getElementById('contact-message');
      const contactDivision = document.getElementById('contact-division');
      const contactSection = document.getElementById('contact');

      if (contactMessage && currentGeneratedScope) {
        contactMessage.value = `[ATTACHED VALTERRA STRATEGIC SCOPE]\nIndustry: ${industrySelect.value}\nChallenge: ${challengeInput.value}\nTarget: ${ambitionInput.value}\n\nKey Strategic Requirements:\n` + currentGeneratedScope.slice(0, 800) + '...';
      }
      if (contactDivision && divisionSelect) {
        contactDivision.value = divisionSelect.value;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Copy Brief
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (currentGeneratedScope) {
        navigator.clipboard.writeText(currentGeneratedScope).then(() => {
          const originalText = copyBtn.innerText;
          copyBtn.innerText = 'Copied to Clipboard!';
          setTimeout(() => copyBtn.innerText = originalText, 2500);
        });
      }
    });
  }

  // Modal helpers
  function promptApiKeyModal() {
    return new Promise((resolve) => {
      if (!apiKeyModal) {
        resolve(null);
        return;
      }
      apiKeyModal.style.display = 'flex';
      saveKeyBtn.onclick = () => {
        const val = apiKeyInput.value.trim();
        apiKeyModal.style.display = 'none';
        resolve(val || null);
      };
      skipKeyBtn.onclick = () => {
        apiKeyModal.style.display = 'none';
        resolve(null);
      };
    });
  }
})();
