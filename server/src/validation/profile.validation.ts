import { HttpError } from '../errors/http-error.js';
import type { Basics, FieldErrors, Profile } from '../types/profile.js';

const fields: { key: keyof Basics; label: string; max: number }[] = [
  { key: 'name', label: 'Name', max: 120 },
  { key: 'label', label: 'Professional title', max: 120 },
  { key: 'email', label: 'Email', max: 254 },
  { key: 'phone', label: 'Phone', max: 50 },
  { key: 'url', label: 'Website', max: 2048 },
  { key: 'summary', label: 'Summary', max: 5000 },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// TypeScript checks our code, but incoming HTTP JSON needs a runtime check too.
export function validateProfile(value: unknown): Profile {
  if (!isRecord(value) || !isRecord(value.basics)) {
    throw new HttpError(400, 'Send a profile object containing a basics object.');
  }

  if (Object.keys(value).some((key) => key !== 'basics')) {
    throw new HttpError(400, 'V1.1 supports only the basics section.');
  }

  const input = value.basics;
  if (Object.keys(input).some((key) => !fields.some((field) => field.key === key))) {
    throw new HttpError(400, 'Basics contains an unsupported field.');
  }

  const basics: Basics = { name: '', label: '', email: '', phone: '', url: '', summary: '' };
  const errors: FieldErrors = {};

  for (const field of fields) {
    const raw = input[field.key];
    if (raw === undefined) continue; // Optional omitted fields become empty strings.
    if (typeof raw !== 'string') {
      errors[field.key] = `${field.label} must be text.`;
      continue;
    }

    basics[field.key] = raw.trim();
    if (basics[field.key].length > field.max) {
      errors[field.key] = `${field.label} must be ${field.max} characters or fewer.`;
    }
  }

  if (!errors.name && !basics.name) errors.name = 'Name is required.';

  if (!errors.email && basics.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!errors.url && basics.url) {
    try {
      const url = new URL(basics.url);
      if (!/^https?:\/\//i.test(basics.url) || !['http:', 'https:'].includes(url.protocol) || !url.hostname) {
        errors.url = 'Enter a full website URL starting with http:// or https://.';
      }
    } catch {
      errors.url = 'Enter a full website URL starting with http:// or https://.';
    }
  }

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Please fix the highlighted fields.', errors);
  }

  return { basics };
}
