const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Use port 4000 by default, or a CLI arg if provided
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// ---------- Middleware ----------

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve static frontend files (for production)
app.use(express.static('public'));

// ---------- In-memory storage (for demo only) ----------

// Users: username -> { passwordHash }
const users = {};

// Sessions: token -> username
const sessions = {};

// Planner data: username -> [ { id, text, created } ]
const plannerData = {};

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

// ---------- Health check (optional but useful) ----------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------- Auth endpoints ----------

// POST /api/auth/register
// body: { username, password }
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password required' });
    }

    if (users[username]) {
      return res.status(409).json({ msg: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    users[username] = { passwordHash };

    console.log(`Registered user: ${username}`);

    res.status(201).json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error('Error in /api/auth/register', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// POST /api/auth/login
// body: { username, password }
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password required' });
    }

    const user = users[username];
    if (!user) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    // Create a session token and store it
    const token = uuidv4();
    sessions[token] = username;

    // Set the session token as an HTTP-only cookie
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

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token && sessions[token]) {
      const username = sessions[token];
      delete sessions[token];
      console.log(`User logged out: ${username}`);
    }

    // Clear the cookie on the client
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // match the login cookie options if using secure
    });

    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Error in /api/auth/logout', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Optional helper: current user
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.token;
  const username = token && sessions[token];

  if (!username) {
    return res.status(200).json({ authenticated: false });
  }

  res.json({ authenticated: true, username });
});

// ---------- Restricted application endpoints ----------

// GET /api/planner  (restricted)
// Returns the current user's planner items
app.get('/api/planner', authMiddleware, (req, res) => {
  try {
    const username = req.username;
    const items = plannerData[username] || [];
    res.json(items);
  } catch (err) {
    console.error('Error in GET /api/planner', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// POST /api/planner  (restricted)
// body: { text }
app.post('/api/planner', authMiddleware, (req, res) => {
  try {
    const username = req.username;
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    if (!plannerData[username]) {
      plannerData[username] = [];
    }

    const item = {
      id: uuidv4(),
      text,
      created: new Date().toISOString(),
    };

    plannerData[username].push(item);

    res.status(201).json(item);
  } catch (err) {
    console.error('Error in POST /api/planner', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// ---------- Start server ----------

app.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
