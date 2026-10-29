import { FREE_EMAIL_DOMAINS } from '@/constants';

/**
 * Validates email syntax and rejects free/public mailbox domains.
 * Returns an error string if invalid, or undefined if valid.
 */
export function validateBusinessEmail(email: string): string | undefined {
  const trimmed = email.trim().toLowerCase();

  // Basic syntax check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }

  // Extract domain
  const domain = trimmed.split('@')[1];

  // Reject free/public mailbox domains
  if (FREE_EMAIL_DOMAINS.includes(domain)) {
    return 'Please use your work email address. Free email providers are not accepted.';
  }

  return undefined;
}

/**
 * Validates phone number with optional country code.
 * Accepts formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX (10 digits)
 */
export function validatePhone(phone: string): string | undefined {
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Must be between 7–15 digits, optionally starting with +
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(cleaned)) {
    return 'Please enter a valid phone number with country code (e.g. +91 98765 43210).';
  }

  return undefined;
}

/**
 * Validates that a required field is not empty.
 */
export function validateRequired(value: string, fieldLabel: string): string | undefined {
  if (!value || value.trim().length === 0) {
    return `${fieldLabel} is required.`;
  }
  return undefined;
}
