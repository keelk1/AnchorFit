export interface Investor {
  name: string;
  website: string;
  type: string;
  hq: string;
  countries: string;
  stage: string;
  minCheque: number;
  maxCheque: number;
}

export interface ScoreResult {
  ac: number;
  fs: number;
  sf: number;
  fc: number;
  rawScore: number;
  finalScore: number;
  tier: 'A' | 'B' | 'C' | 'U';
}

function calculateStageFit(investorStage: string): number {
  const stage = (investorStage || "").toLowerCase();
  const preseedKeys = ["prototype", "early revenue", "pre-seed", "preseed", "idea", "ideation"];
  
  if (preseedKeys.some(key => stage.includes(key))) return 20;
  if (stage.includes("seed") || stage.includes("amorçage")) return 8;
  return 0;
}

function calculateCountryFocus(hq: string, countries: string, targetCountry: string): number {
  const h = (hq || "").toLowerCase();
  const c = (countries || "").toLowerCase();
  const t = (targetCountry || "").toLowerCase();

  if (h.includes(t)) return 15;
  if (c.includes(t)) return 10;
  if (c.includes("europe") || c.includes("global")) return 5;
  return 0;
}

function calculateAnchorCapacity(maxCheque: number, targetRaise: number, sf: number): number {
  if (!maxCheque || maxCheque <= 0) return 0;
  
  const ratio = maxCheque / targetRaise;
  let base = ratio >= 1 ? 30 : Math.round(ratio * 30);
  
  if (sf < 20) {
    base = Math.min(base, 15);
  }
  return base;
}

function calculateFlexScore(minCheque: number, maxCheque: number, targetRaise: number): number {
  if (!minCheque || !maxCheque || maxCheque <= 0 || minCheque < 0 || maxCheque < minCheque) return 0;
  
  const lower = 0.6 * targetRaise;
  const upper = 1.1 * targetRaise;
  
  const overlap = Math.max(0.0, Math.min(maxCheque, upper) - Math.max(minCheque, lower));
  const band = upper - lower;
  
  return band > 0 ? Math.round(25 * (overlap / band)) : 0;
}

export function computeAIx(investor: Investor, targetRaise: number, targetCountry: string): ScoreResult {
  if (!investor.minCheque && !investor.maxCheque) {
    return { ac: 0, fs: 0, sf: 0, fc: 0, rawScore: 0, finalScore: 0, tier: 'U' };
  }

  const sf = calculateStageFit(investor.stage);
  const fc = calculateCountryFocus(investor.hq, investor.countries, targetCountry);
  const ac = calculateAnchorCapacity(investor.maxCheque, targetRaise, sf);
  const fs = calculateFlexScore(investor.minCheque, investor.maxCheque, targetRaise);

  const raw90 = ac + fs + sf + fc;
  const raw100 = Math.round(raw90 * (100.0 / 90.0));

  const checkFields = [investor.minCheque > 0, investor.maxCheque > 0, !!investor.stage, !!investor.countries];
  const confidenceCount = checkFields.filter(Boolean).length;
  
  let malus = 0;
  if (confidenceCount < 2) malus = -10;
  else if (confidenceCount < 4) malus = -5;

  const finalScore = Math.max(0, Math.min(100, raw100 + malus));

  let tier: 'A' | 'B' | 'C' | 'U' = 'C';
  if (finalScore >= 75) tier = 'A';
  else if (finalScore >= 55) tier = 'B';

  return { ac, fs, sf, fc, rawScore: raw100, finalScore, tier };
}
