import { app } from './app.js';

const PORT = 3000;

// Listen on the local machine only for this learning milestone.
app.listen(PORT, 'localhost', () => {
  console.log(`API running at http://localhost:${PORT}`);
});
