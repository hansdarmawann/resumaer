import { emptyBasics, emptyLocation, entryFactories } from '../types/profile';
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
  // Check scalar basics fields
  for (const field of Object.keys(emptyBasics) as (keyof typeof emptyBasics)[]) {
    if (field === 'location' || field === 'profiles') continue;
    if (typeof basics[field] !== 'string') return false;
  }
  // Check location sub-object
  if (!isObject(basics.location)) return false;
  for (const field of Object.keys(emptyLocation)) {
    if (typeof (basics.location as Record<string, unknown>)[field] !== 'string') return false;
  }
  // Check profiles array
  if (!Array.isArray(basics.profiles)) return false;
  if (!basics.profiles.every((p: unknown) =>
    isObject(p) && typeof p.network === 'string' &&
    typeof p.username === 'string' && typeof p.url === 'string')) return false;

  // Check all repeating sections
  return Object.entries(entryFactories).every(([section, createEntry]) => {
    const entries = value[section];
    return Array.isArray(entries) && entries.every((entry: unknown) =>
      isObject(entry) && Object.entries(createEntry()).every(([field, example]) =>
        Array.isArray(example)
          ? Array.isArray(entry[field]) && (entry[field] as unknown[]).every((item: unknown) => typeof item === 'string')
          : typeof entry[field] === 'string'));
  });
}

async function request(options: RequestInit): Promise<Response> {
  try {
    // This timeout covers both receiving headers and reading the response body.
    const timeout = AbortSignal.timeout(10_000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    return await fetch(PROFILE_URL, { ...options, signal });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('Express took too long to respond. Please try again.');
    }
    throw new Error('Couldn\u2019t reach Express at localhost:3000. Check that the server is running.');
  }
}

async function readData(response: Response): Promise<unknown> {
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name)) {
      throw new Error('Express took too long to respond. Please try again.');
    }
    throw new ApiError(`Express returned an unexpected response (HTTP ${response.status}).`, response.status);
  }

  if (!response.ok) {
    const errors: FieldErrors = {};
    if (isObject(data) && isObject(data.errors)) {
      for (const [field, message] of Object.entries(data.errors)) {
        const knownPath = Object.hasOwn(emptyBasics, field) || field === 'basics' ||
          field === 'location' || field === 'profiles' ||
          /^location\.[a-zA-Z]+$/.test(field) ||
          /^profiles(\.\d+(\.\w+)?)?$/.test(field) ||
          /^(work|volunteer|education|awards|certificates|publications|skills|languages|interests|references|projects)(\.\d+(\.\w+)?)?$/.test(field);
        if (knownPath && typeof message === 'string') errors[field] = message;
      }
    }
    const message = isObject(data) && typeof data.message === 'string'
      ? data.message : `The API returned HTTP ${response.status}.`;
    throw new ApiError(message, response.status, errors);
  }
  return data;
}

async function readProfile(response: Response): Promise<Profile> {
  const data = await readData(response);
  if (!isProfile(data)) throw new Error('Express returned an unexpected profile. Please try again.');
  return data;
}

export async function getProfile(signal: AbortSignal): Promise<Profile | null> {
  const response = await request({ method: 'GET', signal });
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

export async function deleteProfile(): Promise<void> {
  const response = await request({ method: 'DELETE' });
  if (response.status === 204) return;
  await readData(response);
  throw new ApiError(`Express returned an unexpected deletion response (HTTP ${response.status}).`, response.status);
}