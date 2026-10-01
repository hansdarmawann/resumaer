import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// The browser page and API have different ports, so they have different origins.
app.use(cors({ origin: 'http://localhost:5173' }));

// A route connects an HTTP method and URL to a request handler.
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

// Listen on the local machine only for this learning milestone.
app.listen(PORT, 'localhost', () => {
  console.log(`API running at http://localhost:${PORT}`);
});
