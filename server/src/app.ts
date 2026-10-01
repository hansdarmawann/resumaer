import express from 'express';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { HttpError } from './errors/http-error.js';
import { profileRouter } from './routes/profile.routes.js';

export const app = express();

// Different ports mean different browser origins, so allow the local Vite page.
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/profile', profileRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'API endpoint not found.' });
});

// Express forwards controller throws and JSON parsing failures to this handler.
const handleError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message, ...(error.errors && { errors: error.errors }) });
    return;
  }

  if (typeof error === 'object' && error !== null && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({ message: 'The request body must contain valid JSON.' });
      return;
    }
    if (error.type === 'entity.too.large') {
      response.status(413).json({ message: 'The profile request is too large. The limit is 1 MB.' });
      return;
    }
    if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
      response.status(415).json({ message: 'Send uncompressed JSON using UTF-8 encoding.' });
      return;
    }
  }

  console.error('Unexpected API error:', error);
  response.status(500).json({ message: 'Something went wrong while processing the profile.' });
};

app.use(handleError);
