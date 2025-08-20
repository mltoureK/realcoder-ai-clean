// Main server entry

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
// using GitHub REST API via fetch; Octokit removed for Node 18 compatibility

import gptRoutes from './routes/gpt.mjs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for uploaded or fetched files
let storedFiles = [];

app.post('/uploadFiles', (req, res) => {
  const { files } = req.body; // files: [{ name, content }]
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  storedFiles = files;
  res.json({ success: true });
});

app.post('/fetchRepo', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'No repo URL provided.' });

  // Reverted behavior: do not fetch repo contents. Just store the URL as a file.
  storedFiles = [{ name: 'repo_url.txt', content: repoUrl }];
  return res.json({ success: true, message: 'Repo URL stored (demo mode).' });
});

app.get('/getStoredFiles', (req, res) => {
  res.json({ files: storedFiles });
});

app.use('/', gptRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});