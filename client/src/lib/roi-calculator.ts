import type { ROIInputs, ROIOutputs, DocumentType, ModelType } from '@/types';

// ─── Pricing data from "Logic and Pricing" sheet ─────────────────────────────
// Band breakpoints (cumulative pages per year):
//   Band 1: up to 36,000 (but sheet shows ≤120,000 for first slab boundary)
//   Based on the spreadsheet columns: 36,001–120,000 | 120,001–300,000 | 300,001–500,000 | 500,001–1,000,000 | Above 1,000,000

interface PricingTier {
  fixedAnnualCost: number; // INR
  rates: [number, number, number, number, number]; // ₹ per page for each band
}

// Key: "<tier>|<model>" — exactly as the spreadsheet "Pricing key" column
const PRICING_TABLE: Record<string, PricingTier> = {
  'tier1|single': { fixedAnnualCost: 25000, rates: [0.07, 0.06, 0.05, 0.04, 0.03] },
  'tier1|multi':  { fixedAnnualCost: 18000, rates: [0.05, 0.04, 0.03, 0.02, 0.01] },
  'tier2|single': { fixedAnnualCost: 36000, rates: [0.09, 0.08, 0.07, 0.05, 0.04] },
  'tier2|multi':  { fixedAnnualCost: 27000, rates: [0.07, 0.06, 0.05, 0.04, 0.03] },
  'tier3|single': { fixedAnnualCost: 54000, rates: [0.15, 0.14, 0.13, 0.12, 0.11] },
  // tier3|multi is not in the sheet — only "single" allowed for tier3
};

// Document type → tier mapping (from "Document Type", "Tier", "Allowed Models" columns)
const DOC_TYPE_TIER: Record<DocumentType, { tier: string; models: ModelType[] }> = {
  'Bank Cheques':      { tier: 'tier1', models: ['Single', 'Multi'] },
  'Bank Documents':    { tier: 'tier1', models: ['Single', 'Multi'] },
  'ID Cards':          { tier: 'tier2', models: ['Single', 'Multi'] },
  'KYC Documents':     { tier: 'tier2', models: ['Single', 'Multi'] },
  'Invoices':          { tier: 'tier2', models: ['Single', 'Multi'] },
  'Bill of Lading':    { tier: 'tier2', models: ['Single', 'Multi'] },
  'Packing List':      { tier: 'tier2', models: ['Single', 'Multi'] },
  'Purchase Orders':   { tier: 'tier2', models: ['Single', 'Multi'] },
  'Contract':          { tier: 'tier3', models: ['Single'] },
  'P&L Statements':    { tier: 'tier3', models: ['Single'] },
  'Cashflow Statement':{ tier: 'tier3', models: ['Single'] },
  // Additional entries for UI dropdown that aren't in sheet → default tier1
  'Trade Finance':     { tier: 'tier1', models: ['Single', 'Multi'] },
  'Insurance Claims':  { tier: 'tier1', models: ['Single', 'Multi'] },
  'Loan Applications': { tier: 'tier1', models: ['Single', 'Multi'] },
  'Medical Records':   { tier: 'tier2', models: ['Single', 'Multi'] },
};

// Pages per year a single manual resource can process (from sheet: Annual Volume / Resources Needed = 36,000 / 1.20 = 30,000)
const PAGES_PER_RESOURCE_PER_YEAR = 30000;

// Slab band upper limits (cumulative) — column headers from sheet
const BANDS = [120000, 300000, 500000, 1000000]; // 5th band = above 1,000,000

/**
 * Calculates KlearStack annual cost using tiered (slab-based) pricing.
 * Pages below 36,000 still use the fixed annual cost only (band 1 rate applies from page 1).
 *
 * From spreadsheet: "Annual Cost = Fixed Annual Cost + cumulative slab charges above 36,000 pages"
 * NOTE: The spreadsheet shows ₹0 annual cost for volumes within the first slab with certain tiers.
 *       Interpretation: Fixed cost always applies; slab charges begin from page 1.
 */
function calcAnnualCost(volume: number, tier: PricingTier): number {
  if (volume <= 0) return 0;

  const { fixedAnnualCost, rates } = tier;

  // Band 1: 1 → 120,000
  const b1 = Math.min(volume, BANDS[0]);
  let variable = b1 * rates[0];

  if (volume > BANDS[0]) {
    // Band 2: 120,001 → 300,000
    const b2 = Math.min(volume - BANDS[0], BANDS[1] - BANDS[0]);
    variable += b2 * rates[1];
  }
  if (volume > BANDS[1]) {
    // Band 3: 300,001 → 500,000
    const b3 = Math.min(volume - BANDS[1], BANDS[2] - BANDS[1]);
    variable += b3 * rates[2];
  }
  if (volume > BANDS[2]) {
    // Band 4: 500,001 → 1,000,000
    const b4 = Math.min(volume - BANDS[2], BANDS[3] - BANDS[2]);
    variable += b4 * rates[3];
  }
  if (volume > BANDS[3]) {
    // Band 5: above 1,000,000
    const b5 = volume - BANDS[3];
    variable += b5 * rates[4];
  }

  return fixedAnnualCost + variable;
}

/**
 * Main ROI calculation — matches spreadsheet formulas exactly:
 *
 *   Resources Needed      = Annual Volume / 30,000
 *   Monthly Manual Cost   = Resources Needed × Avg Monthly Salary
 *   Annual Cost (KS)      = Fixed + cumulative slab charges
 *   Monthly Cost (KS)     = Annual Cost / 12
 *   Net Monthly Savings   = Monthly Manual Cost − Monthly Cost
 *   Annual Savings        = Net Monthly Savings × 12
 *   Equivalent Resources  = ROUND UP (Resources Needed, 0 decimals)  ← sheet says "Round Resources Needed up to the next whole number"
 *   Payback Months        = Monthly Cost / Monthly Manual Cost (rounded to 1 decimal)
 */
export function calculateROI(inputs: ROIInputs): ROIOutputs {
  const { documentType, model, annualVolume, avgMonthlySalary } = inputs;

  const zero: ROIOutputs = {
    resourcesNeeded: 0,
    monthlyManualCost: 0,
    annualCost: 0,
    monthlyKlearStackCost: 0,
    netMonthlySavings: 0,
    annualSavings: 0,
    equivalentResources: 0,
  };

  if (!annualVolume || !avgMonthlySalary || !documentType) return zero;

  // Resolve pricing tier
  const docInfo = DOC_TYPE_TIER[documentType as DocumentType];
  if (!docInfo) return zero;

  const modelKey = model === 'Single' ? 'single' : 'multi';
  const pricingKey = `${docInfo.tier}|${modelKey}`;
  const tier = PRICING_TABLE[pricingKey];

  // Fallback: if model not allowed (e.g. multi on tier3), use single
  const effectiveTier = tier ?? PRICING_TABLE[`${docInfo.tier}|single`];
  if (!effectiveTier) return zero;

  const resourcesNeeded = annualVolume / PAGES_PER_RESOURCE_PER_YEAR;
  const monthlyManualCost = resourcesNeeded * avgMonthlySalary;
  const annualCost = calcAnnualCost(annualVolume, effectiveTier);
  const monthlyKlearStackCost = annualCost / 12;
  const netMonthlySavings = monthlyManualCost - monthlyKlearStackCost;
  const annualSavings = netMonthlySavings * 12;
  const equivalentResources = Math.ceil(resourcesNeeded); // "round up to next whole number"

  return {
    resourcesNeeded: parseFloat(resourcesNeeded.toFixed(2)),
    monthlyManualCost,
    annualCost,
    monthlyKlearStackCost,
    netMonthlySavings,
    annualSavings,
    equivalentResources,
  };
}

/** Format as Indian Rupee — Indian grouping (XX,XX,XXX) */
export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format with Indian grouping, no currency symbol */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Expose allowed models for a document type so UI can disable the wrong toggle */
export function getAllowedModels(documentType: DocumentType | ''): ModelType[] {
  if (!documentType) return ['Single', 'Multi'];
  return DOC_TYPE_TIER[documentType]?.models ?? ['Single', 'Multi'];
}
