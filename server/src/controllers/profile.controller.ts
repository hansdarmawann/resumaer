import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service.js';
import { validateProfile } from '../validation/profile.validation.js';

// Controllers translate HTTP requests into service calls and HTTP responses.
export function getProfile(_request: Request, response: Response): void {
  response.json(profileService.getProfile());
}

export function createProfile(request: Request, response: Response): void {
  const profile = validateProfile(request.body);
  response.status(201).json(profileService.createProfile(profile));
}

export function updateProfile(request: Request, response: Response): void {
  const profile = validateProfile(request.body);
  response.json(profileService.updateProfile(profile));
}

export function deleteProfile(_request: Request, response: Response): void {
  profileService.deleteProfile();
  response.status(204).send();
}
