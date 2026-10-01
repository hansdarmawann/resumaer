import { HttpError } from '../errors/http-error.js';
import type { Profile } from '../types/profile.js';
import { ProfileModel } from '../models/profile.model.js';

export async function getProfile(): Promise<Profile> {
  const profile = await ProfileModel.findOne();
  if (!profile) throw new HttpError(404, 'No saved profile was found.');
  return profile.toJSON();
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const existing = await ProfileModel.findOne();
  if (existing) throw new HttpError(409, 'A profile already exists. Save changes with PUT.');
  const newProfile = new ProfileModel(profile);
  await newProfile.save();
  return newProfile.toJSON();
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const existing = await ProfileModel.findOne();
  if (!existing) throw new HttpError(404, 'No saved profile was found. Create one with POST.');
  const updated = await ProfileModel.findOneAndReplace({}, profile, { returnDocument: 'after', overwrite: true });
  if (!updated) throw new HttpError(404, 'No saved profile was found. Create one with POST.');
  return updated.toJSON();
}

export async function deleteProfile(): Promise<void> {
  const existing = await ProfileModel.findOne();
  if (!existing) throw new HttpError(404, 'No saved profile was found.');
  await ProfileModel.deleteOne({});
}

