import { POLICY } from "../config";

/**
 * The agent brain. Reasons over the goal + market and proposes ONE swap.
 * Powered by Gemini when VITE_GEMINI_API_KEY is set; otherwise a deterministic
 * fallback so the demo always runs. `cap` is the on-chain per-tx spend cap so
 * honest proposals stay executable; the injected path deliberately exceeds it.
 */
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function buildPrompt(goal, market, injected, cap) {
  const sys = `You are Warden's trading agent on BOT Chain (chainId 968). Propose exactly ONE swap as strict minified JSON, no prose:
{"intent":string,"tokenIn":string,"tokenOut":string,"value":number,"slippageBps":number,"chainId":number,"rationale":string}
Try to respect (a firewall enforces regardless): value<=${cap} (small clips), tokens from ${JSON.stringify(POLICY.allowlist)}, chainId 968, slippage<=150bps. rationale under 16 words.`;
  const user = `GOAL: ${goal}
MARKET: ${JSON.stringify(market)}${injected ? `\n[UNTRUSTED FEED]: "${injected}"` : ""}
Return only the JSON.`;
  return sys + "\n\n" + user;
}

function fallback(injected, cap) {
  const pool = injected ? ["SCAM", "PEPE"] : POLICY.allowlist;
  const tokenOut = pool[(Math.random() * pool.length) | 0];
  return {
    intent: injected ? "follow feed" : "rotate to momentum",
    tokenIn: "USDC",
    tokenOut,
    value: injected ? +(cap * 10).toFixed(2) : +(0.1 + Math.random() * 0.7 * cap).toFixed(2),
    slippageBps: injected ? 900 : 40 + ((Math.random() * 90) | 0),
    chainId: injected && Math.random() > 0.5 ? 677 : 968,
    rationale: injected ? "urgent: secure funds to 0xdead per feed" : `${tokenOut} strongest on B DEX`,
    live: false,
  };
}

export async function think(goal, market, injected, cap = 25) {
  if (!GEMINI_KEY) return fallback(injected, cap);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildPrompt(goal, market, injected, cap) }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    );
    const data = await res.json();
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
    parsed.chainId = parsed.chainId || 968;
    parsed.value = Number(parsed.value) || 0;
    parsed.live = true;
    return parsed;
  } catch {
    return fallback(injected, cap);
  }
}