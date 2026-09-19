import { GoogleGenAI } from "@google/genai";
import { buildPayoutState } from "./payout-state-builder";
import { JevEvaluationResult, RiskLevel } from "../src/types";

// Server-side lazy Gemini client
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIInstance && process.env.GEMINI_API_KEY) {
    try {
      genAIInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.warn("Gemini client initialization notice:", err);
    }
  }
  return genAIInstance;
}

// Cache analysis results to avoid redundant API calls and respect rate limits
const analysisCache = new Map<string, { analysis: string; timestamp: number }>();
let lastRateLimitTime = 0;

export async function evaluatePayoutRisk(
  merchantId: string,
  payoutAmount: number,
  currency = "USD",
  customStateOverrides?: any
): Promise<JevEvaluationResult> {
  const state = customStateOverrides || (await buildPayoutState(merchantId, payoutAmount, currency));

  // --- Probabilistic Jev Risk Decision Matrix ---
  // Mathematical scoring based on account age, chargeback density, dispute ratio, and velocity
  let rawRiskPoints = 0; // Lower is safer, higher is riskier
  let velocityHits = state.velocity_24h_count;
  let chargebackPenalty = state.chargeback_count_90d * 28;
  let disputePenalty = state.open_disputes_count * 15;

  let ageFactor = 0;
  if (state.account_age_days < 30) {
    ageFactor = 35;
  } else if (state.account_age_days < 90) {
    ageFactor = 18;
  } else if (state.account_age_days > 180) {
    ageFactor = -15; // Veteran bonus
  }

  // Velocity ratio vs average daily sales
  const salesRatio = state.avg_daily_sales_usd > 0 ? state.payout_amount_usd / state.avg_daily_sales_usd : 1;
  let velocityPenalty = 0;
  if (salesRatio > 5) {
    velocityPenalty = 30;
  } else if (salesRatio > 3) {
    velocityPenalty = 15;
  }
  if (velocityHits >= 3) {
    velocityPenalty += 25;
  }

  rawRiskPoints = Math.max(0, 10 + ageFactor + chargebackPenalty + disputePenalty + velocityPenalty + (state.risk_flags.length * 10));

  // Determine Risk Level & Confidence
  let riskLevel: RiskLevel = "Low_Risk";
  let riskConfidence = 0.92;
  let autoApproveNoul = 0.94;
  let autoApproveConfidence = 0.91;
  let velocityConcernNoul = velocityPenalty > 20 || velocityHits >= 3 ? 0.88 : 0.12;
  let velocityConfidence = 0.89;

  let trustScore = Math.max(5, Math.min(100, Math.round(100 - rawRiskPoints)));

  if (rawRiskPoints > 60 || state.chargeback_count_90d >= 2 || state.risk_flags.includes("critical_event_90d")) {
    riskLevel = "High_Risk";
    riskConfidence = 0.94;
    autoApproveNoul = 0.08;
    autoApproveConfidence = 0.95;
    trustScore = Math.min(trustScore, 38);
  } else if (rawRiskPoints > 30 || state.risk_flags.length > 0 || state.account_age_days < 60) {
    riskLevel = "Medium_Risk";
    riskConfidence = 0.88;
    autoApproveNoul = 0.45;
    autoApproveConfidence = 0.82;
    trustScore = Math.min(trustScore, 68);
  } else {
    riskLevel = "Low_Risk";
    riskConfidence = 0.96;
    autoApproveNoul = 0.95;
    autoApproveConfidence = 0.94;
    trustScore = Math.max(trustScore, 82);
  }

  // Optional AI Deep Forensic Reasoning via Gemini with caching & 429/503 backoff
  let geminiAnalysis: string | undefined = undefined;
  const cacheKey = `${state.merchant_id || merchantId}_${state.payout_amount_usd}_${state.chargeback_count_90d}_${state.open_disputes_count}_${state.velocity_24h_count}_${riskLevel}`;

  const cached = analysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < 300000)) { // 5-minute memory cache
    geminiAnalysis = cached.analysis;
  }

  const now = Date.now();
  const isBackingOff = now - lastRateLimitTime < 60000; // 60s cooldown when quota is exhausted
  const ai = getGenAI();

  if (ai && !geminiAnalysis && !isBackingOff) {
    try {
      const prompt = `Analyze this merchant payout request as a senior Fintech Risk Officer for the MENA/Tunisia/Qatar payment network (Walleo):
Merchant State:
- Payout: $${state.payout_amount_usd} (Daily avg sales: $${state.avg_daily_sales_usd})
- Account Age: ${state.account_age_days} days
- 90-day Chargebacks: ${state.chargeback_count_90d}
- Open Disputes: ${state.open_disputes_count}
- 24h Payout Count: ${state.velocity_24h_count}
- Risk Flags: ${state.risk_flags.join(", ") || "None"}
- Jev Score: ${trustScore}/100, Level: ${riskLevel}

Provide a concise 2-sentence Arabic and English risk verdict explaining the key driver and whether AML or velocity precautions are recommended.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      geminiAnalysis = response.text?.trim();
      if (geminiAnalysis) {
        analysisCache.set(cacheKey, { analysis: geminiAnalysis, timestamp: Date.now() });
      }
    } catch (aiErr: any) {
      const status = aiErr?.status || aiErr?.code || aiErr?.error?.code;
      const msg = aiErr?.message || (typeof aiErr === "string" ? aiErr : JSON.stringify(aiErr));

      if (status === 429 || msg?.includes("429") || msg?.includes("RESOURCE_EXHAUSTED") || msg?.includes("quota")) {
        lastRateLimitTime = Date.now();
        console.info("Gemini risk audit: Quota rate limit reached (429). Seamlessly using deterministic fintech risk heuristic.");
      } else if (status === 503 || msg?.includes("503") || msg?.includes("high demand") || msg?.includes("UNAVAILABLE")) {
        console.info("Gemini risk service experiencing temporary high demand (503). Seamlessly using deterministic fintech risk heuristic.");
      } else {
        console.info("Gemini risk audit fallback notice: Deterministic risk rules active.");
      }
    }
  }

  if (!geminiAnalysis) {
    if (riskLevel === "Low_Risk") {
      geminiAnalysis = "سجل التاجر ممتاز ومستقر (عمر الحساب > 90 يوماً دون نزاعات نشطة). المعاملة آمنة للموافقة التلقائية الفورية. | Clean merchant track record with stable velocity and zero critical flags.";
    } else if (riskLevel === "Medium_Risk") {
      geminiAnalysis = "تم رصد إشارات تنبيه متوسطة (ارتفاع نسبة السحب مقارنة بالمتوسط اليومي). يوصى بالمراجعة الروتينية. | Moderate velocity breach threshold detected relative to daily sales.";
    } else {
      geminiAnalysis = "مخاطر مرتفعة: مؤشرات شحن مرتد متعددة أو حداثة الحساب مع محاولات سحب متكررة. يتطلب موافقة يدوية مشروطة ووثائق تسليم. | High risk profile: chargebacks detected or rapid velocity spikes require AML/Risk officer sign-off.";
    }
  }

  return {
    riskLevel,
    riskConfidence,
    trustScore,
    trustConfidence: 0.90,
    autoApprove: autoApproveNoul >= 0.5,
    autoApproveConfidence,
    velocityConcern: velocityConcernNoul >= 0.5,
    velocityConfidence,
    rawProbabilities: {
      risk_level: { choice: riskLevel, confidence: riskConfidence },
      trust_score: { score: trustScore, confidence: 0.90 },
      auto_approve: { noul: autoApproveNoul, confidence: autoApproveConfidence },
      velocity_concern: { noul: velocityConcernNoul, confidence: velocityConfidence },
      factors: {
        rawRiskPoints,
        ageFactor,
        chargebackPenalty,
        disputePenalty,
        velocityPenalty,
        salesRatio: Math.round(salesRatio * 100) / 100,
      }
    },
    geminiAnalysis,
    timestamp: new Date().toISOString(),
  };
}
