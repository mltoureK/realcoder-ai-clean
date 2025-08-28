// Main server entry

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
// using GitHub REST API via fetch; Octokit removed for Node 18 compatibility

import gptRoutes from './routes/gpt.mjs';

const app = express();

// Add timeout and body size configuration before other middleware
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// Configure CORS for direct frontend connections
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Configure body parsers with very large limits
app.use(express.json({ 
  limit: '5000mb',
  strict: false,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  limit: '5000mb', 
  extended: true,
  strict: false,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Add raw body parser for large payloads /yes
app.use(express.raw({ 
  type: 'application/json',
  limit: '5000mb'
}));

app.use((req, res, next) => {
  console.log(`Request to ${req.path} with content-length: ${req.headers['content-length']}`);
  next();
});

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

	try {
		const m = repoUrl.match(/github\.com\/([^\/]+)\/([^\/#?]+)/);
		if (!m) return res.status(400).json({ error: 'Invalid GitHub URL format.' });
		const [, owner, repo] = m;

		const apiHeaders = {
			'User-Agent': 'realcoder-ai-clean',
			'Accept': 'application/vnd.github+json'
		};
		if (process.env.GITHUB_TOKEN) {
			apiHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
		}

		// 1) Get repository metadata to find default branch
		const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: apiHeaders });
		if (!repoResp.ok) {
			const text = await repoResp.text();
			return res.status(repoResp.status).json({ error: 'Failed to load repository metadata', details: text });
		}
		const repoInfo = await repoResp.json();
		const ref = repoInfo.default_branch || 'main';

		// 2) Get the full tree for the default branch
		const treeResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`, { headers: apiHeaders });
		if (!treeResp.ok) {
			const text = await treeResp.text();
			return res.status(treeResp.status).json({ error: 'Failed to list repository tree', details: text });
		}
		const treeJson = await treeResp.json();
		const tree = Array.isArray(treeJson.tree) ? treeJson.tree : [];

		const allowed = ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.json', '.md', '.html', '.css'];
		const isAllowed = (p) => allowed.some(ext => p.toLowerCase().endsWith(ext));
		const blobs = tree.filter(node => node.type === 'blob' && isAllowed(node.path));

		// 3) Pull raw file contents (cap to avoid huge repos)
		const results = [];
		for (const node of blobs.slice(0, 200)) {
			const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${node.path}`;
			try {
				const r = await fetch(rawUrl, { headers: { 'User-Agent': 'realcoder-ai-clean' } });
				if (!r.ok) continue;
				const content = await r.text();
				results.push({ name: node.path, content });
			} catch (e) {
				console.warn('Failed to fetch', node.path, e.message);
			}
		}

		storedFiles = results;
		return res.json({ success: true, message: `Fetched ${results.length} files from ${owner}/${repo}@${ref}`, files: results.length });
	} catch (err) {
		console.error('Repo fetch error:', err);
		return res.status(500).json({ error: 'Unexpected error while fetching repo', details: err.message });
	}
});

app.get('/getStoredFiles', (req, res) => {
  res.json({ files: storedFiles });
});

app.use('/', gptRoutes);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  if (NODE_ENV === 'production') {
    console.log('🚀 Production mode - serving static files');
    app.use(express.static(path.join(process.cwd(), '../dist')));
  }
});