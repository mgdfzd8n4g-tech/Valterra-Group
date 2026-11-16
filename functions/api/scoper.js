/**
 * Cloudflare Pages Edge Function: /api/scoper
 * Securely interfaces with Google Gemini API to generate executive-grade
 * multi-division digital transformation roadmaps for Valterra Group prospects.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Set up CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key",
  };

  try {
    const payload = await request.json();
    const { industry, challenge, ambition, divisionFocus } = payload;

    if (!industry || !challenge) {
      return new Response(
        JSON.stringify({ error: "Industry and business challenge are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API key in Cloudflare environment or request header (for demo/staging flexibility)
    const apiKey = env.GEMINI_API_KEY || request.headers.get("x-gemini-key");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured on Cloudflare Pages. Please set the secret or provide 'x-gemini-key' header.",
          needsKey: true
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the executive system prompt
    const systemPrompt = `You are the Lead Digital Solutions Architect & Partner at Valterra Group, a premier international digital solutions, engineering, and AI agency headquartered in South Africa with global operations in the UK and Europe.
Valterra operates four elite divisions:
1. Valterra Digital — High-performance bespoke web platforms, modern cloud architectures, enterprise software, and mission-critical digital interfaces.
2. Valterra Marketing — Data-driven brand positioning, performance acquisition funnels, digital PR, and search authority.
3. Valterra AI — Autonomous agentic workflows, custom LLM solutions, business process automation, and intelligent predictive pipelines.
4. Valterra Consulting — Enterprise technology modernization, cloud migration roadmaps, IT risk, and digital transformation strategy.

Your role:
Analyze the prospective client's industry, business challenge, and digital ambition.
Produce an authoritative, executive-ready Strategic Transformation Brief.
Keep your tone calm, authoritative, prestigious, and highly actionable. Avoid generic marketing fluff. Cite realistic modern architecture and strategic milestones.

Format your response in structured Markdown with these exact sections:
### 1. Executive Diagnostic & Market Context
(A concise diagnostic of their bottleneck and emerging competitive pressures in their sector)

### 2. Multi-Division Architectural Solution
- **Valterra Digital:** (Specific platforms, interfaces, or technical frameworks)
- **Valterra Marketing:** (Strategic positioning, growth mechanics, or market authority)
- **Valterra AI:** (Specific AI/automation models, agentic workflows, or LLM integrations)
- **Valterra Consulting:** (Enterprise governance, change management, and phased migration)

### 3. Three-Phase Execution Roadmap
- **Phase 1: Foundation & Discovery (Weeks 1–4):** (Key deliverables)
- **Phase 2: Core Engineering & AI Orchestration (Weeks 5–12):** (Key deliverables)
- **Phase 3: Scale, Optimization & Market Dominance (Weeks 13+):** (Key deliverables)

### 4. Projected Strategic Impact & ROI Metric
(Estimated efficiency gain, time-to-market acceleration, and governance confidence)`;

    const userPrompt = `Client Sector: ${industry}
Primary Operational Challenge / Bottleneck: ${challenge}
Target Strategic Ambition: ${ambition || "Accelerate market leadership and operational efficiency"}
Primary Division of Interest: ${divisionFocus || "Holistic Cross-Division Synergy"}

Generate the executive Valterra Group Strategic Transformation Brief.`;

    // Modern Gemini API endpoint (gemini-4-hydrogen frontier model)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 2500
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: "Gemini API request failed", details: errText }),
        { status: geminiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResponse.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No proposal generated.";

    return new Response(
      JSON.stringify({
        success: true,
        scope: generatedText,
        model: "gemini-4-hydrogen",
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal edge function error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key",
      "Access-Control-Max-Age": "86400",
    },
  });
}
