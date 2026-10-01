import mongoose from 'mongoose';
import { app } from './app.js';

const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/resumaer';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Listen on the local machine only for this learning milestone.
    app.listen(PORT, 'localhost', () => {
      console.log(`API running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

