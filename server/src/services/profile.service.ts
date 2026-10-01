import { HttpError } from '../errors/http-error.js';
import type { Profile } from '../types/profile.js';

// This single profile survives browser refreshes, but not an Express restart.
let storedProfile: Profile | undefined;

export function getProfile(): Profile {
  if (!storedProfile) throw new HttpError(404, 'No saved profile was found.');
  return structuredClone(storedProfile);
}

export function createProfile(profile: Profile): Profile {
  if (storedProfile) throw new HttpError(409, 'A profile already exists. Save changes with PUT.');
  storedProfile = structuredClone(profile);
  return getProfile();
}

export function updateProfile(profile: Profile): Profile {
  if (!storedProfile) throw new HttpError(404, 'No saved profile was found. Create one with POST.');
  storedProfile = structuredClone(profile);
  return getProfile();
}

export function deleteProfile(): void {
  if (!storedProfile) throw new HttpError(404, 'No saved profile was found.');
  storedProfile = undefined;
}
