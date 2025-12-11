// service/index.js

const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// 🔌 HTTP + WebSocket
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// 🔗 Our Mongo helper
const db = require('./database');

const app = express();

// Use port 4000 by default, or a CLI arg if provided
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// ---------- Middleware ----------

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve static frontend files (for production) from ./public
// This matches what deployService.sh creates on the server
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


// ---------- (keep all your /api/... routes here) ----------

// Fallback to frontend for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path === '/ws') {
    return res.status(404).json({ msg: 'Not found' });
  }

  res.sendFile(path.join(publicPath, 'index.html'));
});

// ---------- In-memory sessions (OK for this class) ----------

// Sessions: token -> username
const sessions = {};

// ---------- Auth middleware ----------

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  const username = token && sessions[token];

  if (!username) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  req.username = username;
  next();
}

// ---------- Health check ----------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------- Auth: who am I? ----------

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.token;
  const username = token && sessions[token];

  if (!username) {
    return res.json({ authenticated: false });
  }

  res.json({ authenticated: true, username });
});

// ---------- Auth: register ----------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: 'Username and password required' });
    }

    // Check if user already exists in Mongo
    const existing = await db.getUser(username);
    if (existing) {
      return res.status(409).json({ msg: 'User already exists' });
    }

    // Hash and store in Mongo
    const passwordHash = await bcrypt.hash(password, 10);
    await db.addUser({ username, passwordHash });

    console.log(`Registered user: ${username}`);

    res.status(201).json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error('Error in /api/auth/register', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Auth: login ----------

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: 'Username and password required' });
    }

    // Look up user from Mongo
    const user = await db.getUser(username);
    if (!user) {
      return res
        .status(401)
        .json({ msg: 'Invalid username or password' });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res
        .status(401)
        .json({ msg: 'Invalid username or password' });
    }

    // Create session token and set cookie
    const token = uuidv4();
    sessions[token] = username;

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // enable in real HTTPS production
    });

    console.log(`User logged in: ${username}`);

    res.json({ msg: 'Logged in successfully' });
  } catch (err) {
    console.error('Error in /api/auth/login', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Auth: logout ----------

app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      delete sessions[token];
    }

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // match what you use in login
    });

    res.json({ msg: 'Logged out' });
  } catch (err) {
    console.error('Error in /api/auth/logout', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Planner: get items ----------

app.get('/api/planner', authMiddleware, async (req, res) => {
  try {
    const username = req.username;

    const items = await db.getPlannerItems(username);

    res.json(items);
  } catch (err) {
    console.error('Error in GET /api/planner', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Planner: add item ----------

// we'll broadcast over WS when a new item is added
let broadcastPlannerItem = () => {}; // placeholder, real fn defined after wss setup

app.post('/api/planner', authMiddleware, async (req, res) => {
  try {
    const username = req.username;
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    const item = {
      id: uuidv4(),
      username,
      text,
      created: new Date().toISOString(),
    };

    await db.addPlannerItem(item);

    // 🔊 push anonymized info over WebSocket
    broadcastPlannerItem(item);

    res.status(201).json(item);
  } catch (err) {
    console.error('Error in POST /api/planner', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Fallback to frontend for non-API routes ----------

app.get('*', (req, res) => {
  // let API and WS paths fall through to 404 / upgrade handling
  if (req.path.startsWith('/api') || req.path === '/ws') {
    return res.status(404).json({ msg: 'Not found' });
  }

  res.sendFile(path.join(publicPath, 'index.html'));
});

// ---------- WebSocket setup ----------

// Create HTTP server from Express app
const server = http.createServer(app);

// Create WebSocket server on same port, under /ws
const wss = new WebSocket.Server({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);

  ws.send(
    JSON.stringify({
      type: 'welcome',
      message: 'Welcome to the Side Pot live feed!',
    })
  );

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });
});

// Real broadcast helper now that wss exists
broadcastPlannerItem = (item) => {
  const payload = JSON.stringify({
    type: 'savings_event',
    amount: item.text, // or parse number from text if you have structure
    created: item.created,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

// ---------- Start server ----------

server.listen(port, () => {
  console.log(`Service + WebSocket listening on port ${port}`);
});
