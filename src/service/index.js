const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000; // REQUIRED

app.use(express.json());
app.use(cookieParser());

// When deployed, serve frontend from /public
app.use(express.static('public'));

// ----- In-memory “database” -----
const users = {};
const sessions = {};
const plannerItems = {}; // keyed by username

// ----- Auth helpers -----
function getUserFromToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  const username = sessions[token];
  return username || null;
}

function authMiddleware(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ msg: 'unauthorized' });
  req.username = user;
  next();
}

// ----- Auth endpoints -----

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'missing fields' });
  if (users[username]) return res.status(409).json({ msg: 'user exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  users[username] = { username, passwordHash };

  const token = uuidv4();
  sessions[token] = username;
  res.cookie('token', token, { httpOnly: true });
  res.status(201).json({ username });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(401).json({ msg: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ msg: 'invalid credentials' });

  const token = uuidv4();
  sessions[token] = username;
  res.cookie('token', token, { httpOnly: true });
  res.json({ username });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    delete sessions[token];
    res.clearCookie('token');
  }
  res.status(204).end();
});

// ----- Restricted / app endpoints -----

// Example: planner items only for logged-in users
app.get('/api/planner', authMiddleware, (req, res) => {
  const items = plannerItems[req.username] || [];
  res.json(items);
});

app.post('/api/planner', authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: 'missing text' });

  const item = { id: uuidv4(), text, createdAt: new Date().toISOString() };
  if (!plannerItems[req.username]) plannerItems[req.username] = [];
  plannerItems[req.username].push(item);
  res.status(201).json(item);
});

// Healthcheck / simple public endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Startup service listening on port ${port}`);
});