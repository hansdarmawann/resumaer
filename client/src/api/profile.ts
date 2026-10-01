import { emptyBasics } from '../types/profile';
import type { FieldErrors, Profile } from '../types/profile';

const PROFILE_URL = 'http://localhost:3000/api/profile';

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProfile(value: unknown): value is Profile {
  if (!isObject(value) || !isObject(value.basics)) return false;
  const basics = value.basics;
  return Object.keys(emptyBasics).every((field) => typeof basics[field] === 'string');
}

async function request(options: RequestInit): Promise<Response> {
  try {
    // A timeout ensures a request cannot leave the form busy indefinitely.
    const timeout = AbortSignal.timeout(10_000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    return await fetch(PROFILE_URL, { ...options, signal });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('Express took too long to respond. Please try again.');
    }
    throw new Error('Couldn’t reach Express at localhost:3000. Check that the server is running.');
  }
}

async function readProfile(response: Response): Promise<Profile> {
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    // The timeout can also expire after headers arrive, while reading the body.
    if (error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name)) {
      throw new Error('Express took too long to respond. Please try again.');
    }
    throw new ApiError(`Express returned an unexpected response (HTTP ${response.status}).`, response.status);
  }

  // fetch resolves for HTTP errors; check response.ok explicitly.
  if (!response.ok) {
    const errors: FieldErrors = {};
    if (isObject(data) && isObject(data.errors)) {
      for (const field of Object.keys(emptyBasics) as (keyof FieldErrors)[]) {
        if (typeof data.errors[field] === 'string') errors[field] = data.errors[field];
      }
    }
    const message = isObject(data) && typeof data.message === 'string'
      ? data.message
      : `The API returned HTTP ${response.status}.`;
    throw new ApiError(message, response.status, errors);
  }

  // TypeScript types do not check network JSON at runtime.
  if (!isProfile(data)) throw new Error('Express returned an unexpected profile. Please try again.');
  return data;
}

export async function getProfile(signal: AbortSignal): Promise<Profile | null> {
  const response = await request({ method: 'GET', signal });
  // An empty in-memory store is a normal first visit, not a failed load.
  if (response.status === 404) return null;
  return readProfile(response);
}

export async function saveProfile(profile: Profile, exists: boolean): Promise<Profile> {
  const response = await request({
    method: exists ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return readProfile(response);
}
