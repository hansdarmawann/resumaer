import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { HttpError } from '../errors/http-error.js';

export const profileRouter = Router();

function requireJson(request: Request, _response: Response, next: NextFunction): void {
  const mediaType = request.get('Content-Type')?.split(';')[0]?.trim().toLowerCase();
  if (mediaType !== 'application/json') {
    throw new HttpError(415, 'Send the profile with Content-Type: application/json.');
  }
  next();
}

// Each route connects an HTTP method and URL to a controller.
profileRouter.get('/', profileController.getProfile);
profileRouter.post('/', requireJson, profileController.createProfile);
profileRouter.put('/', requireJson, profileController.updateProfile);
profileRouter.delete('/', profileController.deleteProfile);
