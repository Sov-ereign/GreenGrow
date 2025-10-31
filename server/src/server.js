import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

start();