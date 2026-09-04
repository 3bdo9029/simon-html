// index.js (full file)

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');
const WebSocket = require('ws');

const authCookieName = 'token';

// The service port may be set on the command line
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the application's static content
app.use(express.static('public'));

// Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

/**
 * Helpers
 */
async function findUser(field, value) {
  if (!value) return null;

  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  // DB.getUser expects email (per Simon pattern)
  return DB.getUser(value);
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    username: email,      // ✅ important
    password: passwordHash,
    token: uuid.v4(),
  };

  await DB.addUser(user);
  return user;
}


// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true, // requires https in production
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies[authCookieName];
    const user = await findUser('token', token);
    if (user) return next();
    return res.status(401).send({ msg: 'Unauthorized' });
  } catch (e) {
    console.error('verifyAuth failed:', e);
    return res.status(503).send({ msg: 'Database unavailable' });
  }
};

function getEmailFromBody(req) {
  return (req.body.email ?? req.body.username ?? '').trim();
}

/**
 * AUTH ROUTES
 * Supports BOTH {email, password} and {username, password}
 * Adds aliases: /auth/register and POST /auth/logout
 */

// Create account
apiRouter.post('/auth/create', async (req, res) => {
  try {
    const email = getEmailFromBody(req);

    if (await findUser('email', email)) {
      return res.status(409).send({ msg: 'Existing user' });
    }

    const user = await createUser(email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } catch (e) {
    console.error(e);
    res.status(503).send({ msg: 'Database unavailable' });
  }
});


// Alias for frontends calling /auth/register
apiRouter.post('/auth/register', async (req, res) => {
  // just reuse the same logic as /auth/create
  try {
    const email = getEmailFromBody(req);

    if (await findUser('email', email)) {
      return res.status(409).send({ msg: 'Existing user' });
    }

    const user = await createUser(email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } catch (e) {
    console.error(e);
    res.status(503).send({ msg: 'Database unavailable' });
  }
});


// Login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = getEmailFromBody(req);
    const password = req.body.password ?? '';

    console.log('LOGIN attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).send({ msg: 'Missing email/username or password' });
    }

    const user = await findUser('email', email);

    if (!user) {
      console.log('LOGIN fail: user not found for', email);
      return res.status(401).send({ msg: 'Unauthorized' });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      console.log('LOGIN fail: password mismatch for', email);
      return res.status(401).send({ msg: 'Unauthorized' });
    }

    user.token = uuid.v4();
    await DB.updateUser(user);
    setAuthCookie(res, user.token);
    return res.send({ email: user.email, username: user.email });
  } catch (e) {
    console.error('LOGIN error:', e);
    return res.status(503).send({ msg: 'Database unavailable' });
  }
});



// "Who am I" (prevents the "<!DOCTYPE" JSON parse error)
apiRouter.get('/auth/me', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = await findUser('token', token);

    if (user) {
      return res.send({ authenticated: true, email: user.email, username: user.email });
    }
    return res.send({ authenticated: false });
  } catch (e) {
    console.error('GET /api/auth/me failed:', e);
    // IMPORTANT: still return JSON so frontend doesn't die
    return res.status(200).send({ authenticated: false });
  }
});



// Logout (DELETE version)
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Logout (POST alias, in case frontend uses POST)
apiRouter.post('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

/**
 * APP ROUTES
 */

// GetScores
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await DB.getHighScores();
  res.send(scores);
});

// SubmitScore
apiRouter.post('/score', verifyAuth, async (req, res) => {
  const scores = await updateScores(req.body);
  res.send(scores);
});

// updateScores considers a new score for inclusion in the high scores.
async function updateScores(newScore) {
  await DB.addScore(newScore);
  return DB.getHighScores();
}

/**
 * Default error handler (always JSON)
 */
app.use(function (err, _req, res, _next) {
  res.status(500).send({ type: err.name, message: err.message });
});

/**
 * SPA fallback (must be AFTER /api routes)
 */
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

/**
 * Start server
 */
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

/**
 * WebSocket server
 */
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (msg) => {
    console.log('Received:', msg.toString());

    // Echo back, or broadcast if needed
    ws.send(JSON.stringify({ message: 'Server received: ' + msg.toString() }));
  });

  ws.send(JSON.stringify({ message: 'Welcome to the Startup WebSocket!' }));
});

function getEmailFromBody(req) {
  return req.body.email ?? req.body.username; // supports both
}
