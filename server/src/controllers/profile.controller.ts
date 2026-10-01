import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service.js';
import { validateProfile } from '../validation/profile.validation.js';

// Controllers translate HTTP requests into service calls and HTTP responses.
export async function getProfile(_request: Request, response: Response): Promise<void> {
  response.json(await profileService.getProfile());
}

export async function createProfile(request: Request, response: Response): Promise<void> {
  const profile = validateProfile(request.body);
  response.status(201).json(await profileService.createProfile(profile));
}

export async function updateProfile(request: Request, response: Response): Promise<void> {
  const profile = validateProfile(request.body);
  response.json(await profileService.updateProfile(profile));
}

export async function deleteProfile(_request: Request, response: Response): Promise<void> {
  await profileService.deleteProfile();
  response.status(204).send();
}

