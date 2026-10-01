import type { FieldErrors } from '../types/profile.js';

// An expected failure has a status and a message that are safe to send to the browser.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: FieldErrors,
  ) {
    super(message);
  }
}
