// Main server entry

import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import gptRoutes from './routes/gpt.mjs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/', gptRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});