import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateROI, formatINR, formatNumber, getAllowedModels } from '@/lib/roi-calculator';
import { ROI_DOCUMENT_TYPES } from '@/constants';
import type { ROIInputs, DocumentType, ModelType } from '@/types';

const VOLUME_MIN = 1000;
const VOLUME_MAX = 1000000;
const VOLUME_DEFAULT = 36000;

const SALARY_MIN = 10000;
const SALARY_MAX = 200000;
const SALARY_DEFAULT = 73000;

// ── Custom thumb slider ───────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  id: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1000, onChange, format, id }) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label htmlFor={id} className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {label}
        </label>
        <span className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-full">
          {format(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 bg-blue-200 rounded-full" />
        {/* Filled portion */}
        <div
          className="absolute left-0 h-1.5 bg-primary rounded-full pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        {/* Native input (invisible, provides interaction) */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
        />
        {/* Custom thumb */}
        <div
          className="absolute w-5 h-5 bg-primary rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  );
};

// ── Result card ───────────────────────────────────────────────────────────────
interface ResultCardProps {
  label: string;
  value: string;
  subLabel: string;
  highlight?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, subLabel, highlight }) => (
  <div
    className={cn(
      'rounded-xl p-5 flex flex-col items-center text-center border transition-all',
      highlight ? 'border-primary/20 bg-primary/5' : 'border-border bg-white',
    )}
  >
    <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', highlight ? 'text-primary' : 'text-text-muted')}>
      {label}
    </p>
    <p className={cn('text-2xl sm:text-3xl font-extrabold', highlight ? 'text-primary' : 'text-text-primary')}>
      {value}
    </p>
    <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">{subLabel}</p>
  </div>
);

// ── Main ROI Calculator ───────────────────────────────────────────────────────
const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ROIInputs>({
    documentType: '',
    model: 'Single',
    annualVolume: VOLUME_DEFAULT,
    avgMonthlySalary: SALARY_DEFAULT,
  });

  const outputs = useMemo(() => calculateROI(inputs), [inputs]);
  const allowedModels = useMemo(() => getAllowedModels(inputs.documentType), [inputs.documentType]);

  const setField = <K extends keyof ROIInputs>(key: K, val: ROIInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  // If current model is not allowed for the selected doc type, switch to Single
  const handleDocTypeChange = (dt: string) => {
    const allowed = getAllowedModels(dt as DocumentType);
    setInputs((prev) => ({
      ...prev,
      documentType: dt as DocumentType,
      model: allowed.includes(prev.model) ? prev.model : 'Single',
    }));
  };

  return (
    <section id="roi-calculator" className="py-16 lg:py-24 bg-white" aria-labelledby="roi-heading">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h2 id="roi-heading" className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1">
                Calculate Your Savings
              </h2>
              <p className="text-text-secondary text-sm">
                See how much time and money you can save with KlearStack AI.
              </p>
            </div>

            {/* Model toggle */}
            <div
              className="flex items-center gap-1 bg-surface rounded-full p-1 self-start"
              role="group"
              aria-label="Select model type"
            >
              {(['Single', 'Multi'] as ModelType[]).map((m) => {
                const disabled = !allowedModels.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => !disabled && setField('model', m)}
                    disabled={disabled}
                    title={disabled ? `${m}-Shot not available for this document type` : undefined}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                      inputs.model === m && !disabled
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-primary',
                      disabled && 'opacity-40 cursor-not-allowed',
                    )}
                    aria-pressed={inputs.model === m}
                  >
                    {m}-Shot Model
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator card */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-6">
            {/* Document type */}
            <div className="mb-6">
              <label htmlFor="doc-type" className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Document Type
              </label>
              <div className="relative">
                <select
                  id="doc-type"
                  value={inputs.documentType}
                  onChange={(e) => handleDocTypeChange(e.target.value)}
                  className="w-full appearance-none input-field pr-10 bg-white cursor-pointer"
                >
                  <option value="">Select Document Type</option>
                  {ROI_DOCUMENT_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs">▼</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid sm:grid-cols-2 gap-8">
              <Slider
                id="annual-volume"
                label="Document Volume (Pages)"
                value={inputs.annualVolume}
                min={VOLUME_MIN}
                max={VOLUME_MAX}
                step={1000}
                onChange={(v) => setField('annualVolume', v)}
                format={(v) => `${formatNumber(v)} pages`}
              />
              <Slider
                id="monthly-salary"
                label="Average Monthly Salary per Resource"
                value={inputs.avgMonthlySalary}
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={1000}
                onChange={(v) => setField('avgMonthlySalary', v)}
                format={(v) => formatINR(v)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <ResultCard
              label="Net Monthly Savings"
              value={formatINR(outputs.netMonthlySavings)}
              subLabel="Compared to manual labor"
              highlight
            />
            <ResultCard
              label="Annual Savings"
              value={formatINR(outputs.annualSavings)}
              subLabel="Total saved per year"
            />
            <ResultCard
              label="Equivalent Resources"
              value={String(outputs.equivalentResources)}
              subLabel="People replaced by KlearStack"
            />
          </div>

          <p className="text-xs text-center text-text-muted mb-8">
            * 15% lesser price in the Annual Plan
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <a href="#lead-form" className="btn-primary text-base px-8 py-4">
              Automate your workflows with us <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
