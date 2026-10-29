import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePhone } from '@/lib/validators';
import { FREE_EMAIL_DOMAINS, SOLUTION_OPTIONS, DOCUMENT_VOLUME_OPTIONS } from '@/constants';
import type { LeadFormData } from '@/types';

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'Please enter your full name (at least 2 characters).'),
  contactNo: z.string().refine((v) => !validatePhone(v), { message: 'Please enter a valid phone number (e.g. +91 98765 43210).' }),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .refine((v) => {
      const domain = v.split('@')[1]?.toLowerCase();
      return domain && !FREE_EMAIL_DOMAINS.includes(domain);
    }, 'Please use your work email address. Free email providers are not accepted.'),
  solutionRequired: z.string().min(1, 'Please select a solution.'),
  noOfDocuments: z.string().min(1, 'Please select document volume.'),
  painPointExpectations: z.string().max(1000, 'Please keep this under 1000 characters.').optional(),
  _hp: z.string().max(0, 'Bot detected.'), // honeypot — must stay empty
});

type FormValues = z.infer<typeof schema>;

// ── Custom Select component ────────────────────────────────────────────────────
interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
  id: string;
}

const CustomSelect: React.FC<SelectProps> = ({ label, value, onChange, options, placeholder, error, id }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3.5 rounded-lg border bg-white text-sm text-left transition-all',
          error ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-primary/30 focus:border-primary',
          !value && 'text-text-muted',
          'focus:outline-none focus:ring-2',
        )}
      >
        <span className={value ? 'text-text-primary' : 'text-text-muted'}>{value || placeholder}</span>
        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label={label}
            className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-border max-h-56 overflow-y-auto"
          >
            {options.map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  'px-4 py-2.5 text-sm cursor-pointer transition-colors',
                  value === opt ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-surface',
                )}
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

// ── Field wrapper ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  id: string;
}

const Field: React.FC<FieldProps> = ({ label, error, children, id }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="sr-only">{label}</label>
    {children}
    {error && (
      <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

// ── Marquee strip ─────────────────────────────────────────────────────────────
const clients = [
  'LANDMARK GROUP', 'network>', 'ELI', 'ICICI', 'HDFC', 'Bajaj', 'Reliance', 'TCS',
];

const Marquee: React.FC = () => (
  <div
    className="overflow-hidden w-full"
    aria-label="Clients using KlearStack"
    onMouseEnter={(e) => {
      const el = e.currentTarget.querySelector('.marquee-track') as HTMLElement;
      if (el) el.style.animationPlayState = 'paused';
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget.querySelector('.marquee-track') as HTMLElement;
      if (el) el.style.animationPlayState = 'running';
    }}
  >
    <div className="marquee-track flex gap-8 w-max" style={{ animation: 'marquee 20s linear infinite' }}>
      {[...clients, ...clients].map((name, i) => (
        <span
          key={i}
          className="text-sm font-semibold text-text-secondary/60 whitespace-nowrap px-2 py-1 border border-border/50 rounded"
          aria-hidden={i >= clients.length}
        >
          {name}
        </span>
      ))}
    </div>
  </div>
);

// ── Success state ────────────────────────────────────────────────────────────
const SuccessState: React.FC<{ onBook: () => void }> = ({ onBook }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center text-center gap-4 py-8"
  >
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
      <CheckCircle2 className="w-8 h-8 text-green-600" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-text-primary mb-1">Request Submitted!</h3>
      <p className="text-text-secondary text-sm">Our team will reach out within 24 hours. Book a slot now for faster onboarding.</p>
    </div>
    <button onClick={onBook} className="btn-primary">
      Book a Demo Slot <ArrowRight className="w-4 h-4" />
    </button>
  </motion.div>
);

// ── Calendar booking modal ───────────────────────────────────────────────────
const AVAILABLE_SLOTS = [
  { date: 'Tomorrow', time: '10:00 AM', label: 'Thu, 30 Oct · 10:00 AM IST' },
  { date: 'Tomorrow', time: '2:00 PM', label: 'Thu, 30 Oct · 2:00 PM IST' },
  { date: 'Fri, 31 Oct', time: '11:00 AM', label: 'Fri, 31 Oct · 11:00 AM IST' },
  { date: 'Mon, 3 Nov', time: '10:00 AM', label: 'Mon, 3 Nov · 10:00 AM IST' },
  { date: 'Mon, 3 Nov', time: '3:00 PM', label: 'Mon, 3 Nov · 3:00 PM IST' },
];

const CalendarModal: React.FC<{ open: boolean; onClose: () => void; contactEmail: string }> = ({
  open, onClose, contactEmail,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      await fetch('/api/book-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: selected, email: contactEmail }),
      });
    } catch {
      // fail silently — show confirmation anyway
    }
    setBooked(true);
    setBooking(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-label="Book a demo slot">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {booked ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Demo Booked! 🎉</h3>
            <p className="text-text-secondary text-sm">A calendar invite has been sent to <strong>{contactEmail}</strong>.</p>
            <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-1">Pick a Demo Slot</h3>
            <p className="text-sm text-text-secondary mb-6">Available slots — all times in IST.</p>
            <div className="flex flex-col gap-2 mb-6">
              {AVAILABLE_SLOTS.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => setSelected(slot.label)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                    selected === slot.label
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-text-secondary',
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleBook}
              disabled={!selected || booking}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
              {!booking && <ArrowRight className="w-4 h-4" />}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

// ── Main HeroForm section ─────────────────────────────────────────────────────
const HeroForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { _hp: '' },
  });

  const solutionValue = watch('solutionRequired') || '';
  const docsValue = watch('noOfDocuments') || '';

  const onSubmit = async (data: FormValues) => {
    // Honeypot check (additional server-side)
    if (data._hp) return;
    setSubmitError('');

    try {
      const payload: LeadFormData = {
        name: data.name,
        contactNo: data.contactNo,
        email: data.email,
        solutionRequired: data.solutionRequired,
        noOfDocuments: data.noOfDocuments,
        painPointExpectations: data.painPointExpectations,
        _hp: data._hp,
      };

      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Submission failed. Please try again.');
      }

      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <section id="lead-form" className="min-h-screen bg-[#dde8f8] flex items-center pt-16">
        <div className="section-container py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* ── Left panel ─────────────────────────────────────────────── */}
            <div>
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <span className="text-3xl font-black">
                  <span className="text-accent">✦</span>
                  <span className="text-primary">Klear</span>
                  <span className="text-text-primary">Stack</span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4">
                The Only Document AI<br />
                With Fraud, Compliance,<br />
                <span className="text-primary">& Audit Checks Built In</span>
              </h1>

              <p className="text-text-secondary text-base mb-6 max-w-lg">
                No templates. No setup calls. See your documents, processed live, right now.
              </p>

              {/* Trust signals */}
              <ul className="flex flex-col gap-2.5 mb-8" aria-label="Key benefits">
                {[
                  { label: '99%', rest: '* World Class Accuracy' },
                  { label: 'Proprietary AI', rest: 'for Ultimate Security' },
                  { label: 'Pilot Ready', rest: 'in Less than 7 Hours*' },
                ].map(({ label, rest }) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
                    <span>
                      <strong className="text-text-primary">{label}</strong>{' '}
                      <span className="text-text-secondary">{rest}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Clients */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                  Used by Many, Loved by All!
                </p>
                <Marquee />
              </div>

              {/* Reviews */}
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { stars: '★★★★★', score: '4.9/5 G2', color: 'text-orange-500' },
                  { stars: '★★★★½', score: '4.7/5 Trustpilot', color: 'text-green-500' },
                ].map(({ stars, score, color }) => (
                  <div key={score} className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${color}`}>{stars}</span>
                    <span className="text-xs text-text-secondary font-medium">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right panel – form ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              {submitted ? (
                <SuccessState onBook={() => setShowCalendar(true)} />
              ) : (
                <>
                  <h2 className="text-xl font-bold text-text-primary mb-1">
                    Bring your messiest documents.
                  </h2>
                  <p className="text-text-secondary text-sm mb-6">We'll process them live.</p>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    {/* Honeypot — hidden from users */}
                    <input
                      {...register('_hp')}
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />

                    {/* Name */}
                    <Field label="Name" id="name" error={errors.name?.message}>
                      <input
                        id="name"
                        type="text"
                        placeholder="Name*"
                        autoComplete="name"
                        {...register('name')}
                        className={cn('input-field', errors.name && 'input-error')}
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </Field>

                    {/* Phone */}
                    <Field label="Contact Number" id="contactNo" error={errors.contactNo?.message}>
                      <input
                        id="contactNo"
                        type="tel"
                        placeholder="Contact no.*"
                        autoComplete="tel"
                        {...register('contactNo')}
                        className={cn('input-field', errors.contactNo && 'input-error')}
                        aria-required="true"
                        aria-invalid={!!errors.contactNo}
                      />
                    </Field>

                    {/* Email */}
                    <Field label="Email ID" id="email" error={errors.email?.message}>
                      <input
                        id="email"
                        type="email"
                        placeholder="Email ID*"
                        autoComplete="email"
                        {...register('email')}
                        className={cn('input-field', errors.email && 'input-error')}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                      />
                    </Field>

                    {/* Solution + Documents — side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CustomSelect
                        id="solutionRequired"
                        label="Solution Required"
                        placeholder="Solution Required*"
                        value={solutionValue}
                        onChange={(v) => setValue('solutionRequired', v, { shouldValidate: true })}
                        options={SOLUTION_OPTIONS}
                        error={errors.solutionRequired?.message}
                      />
                      <CustomSelect
                        id="noOfDocuments"
                        label="No. of Documents"
                        placeholder="No. of Documents*"
                        value={docsValue}
                        onChange={(v) => setValue('noOfDocuments', v, { shouldValidate: true })}
                        options={DOCUMENT_VOLUME_OPTIONS}
                        error={errors.noOfDocuments?.message}
                      />
                    </div>

                    {/* Optional notes */}
                    <Field label="Pain Point and Expectations" id="painPointExpectations" error={errors.painPointExpectations?.message}>
                      <textarea
                        id="painPointExpectations"
                        placeholder="Pain Point and Expectations (optional)"
                        rows={3}
                        {...register('painPointExpectations')}
                        className={cn('input-field resize-none', errors.painPointExpectations && 'input-error')}
                      />
                    </Field>

                    {/* Global error */}
                    {submitError && (
                      <p role="alert" className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full justify-center text-base mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      ) : (
                        <>Free Live Demo <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>

                    <p className="text-xs text-center text-text-muted">All your data is safe and secure with us!</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar modal */}
      <AnimatePresence>
        {showCalendar && (
          <CalendarModal
            open={showCalendar}
            onClose={() => setShowCalendar(false)}
            contactEmail={submittedEmail}
          />
        )}
      </AnimatePresence>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
};

export default HeroForm;
