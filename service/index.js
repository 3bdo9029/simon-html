const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const DB = require('./database.js');
const { peerProxy } = require('./peerProxy.js');

const app = express();

const authCookieName = 'token';

// The service port. In production the frontend is statically hosted by this service.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing
app.use(express.json());

// Cookie parsing for auth tokens
app.use(cookieParser());

// Serve the built frontend. The deploy step copies Vite's dist output
// into public/ next to this file (see build assembly in deployService flow).
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Register a new user
apiRouter.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ msg: 'Email and password are required' });
  }
  if (await DB.getUser(username)) {
    return res.status(409).send({ msg: 'A user with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email: username, passwordHash, token: uuid.v4() };
  await DB.addUser(user);

  setAuthCookie(res, user.token);
  res.send({ msg: 'Account created', email: user.email });
});

// Login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await DB.getUser(username);
  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    user.token = uuid.v4();
    await DB.updateUser(user);
    setAuthCookie(res, user.token);
    return res.send({ msg: 'Logged in', email: user.email });
  }
  res.status(401).send({ msg: 'Invalid email or password' });
});

// Logout
apiRouter.post('/auth/logout', async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Who am I?
apiRouter.get('/auth/me', async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    return res.send({ authenticated: true, username: user.email });
  }
  res.send({ authenticated: false });
});

// Middleware: everything below requires authentication
async function verifyAuth(req, res, next) {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  req.user = user;
  next();
}

// Planner items
apiRouter.get('/planner', verifyAuth, async (req, res) => {
  res.send(await DB.getPlannerItems(req.user.email));
});

apiRouter.post('/planner', verifyAuth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).send({ msg: 'Text is required' });
  }
  const item = { id: uuid.v4(), owner: req.user.email, text, created: new Date().toISOString() };
  await DB.addPlannerItem(item);
  res.send(item);
});

// Contributions
apiRouter.get('/contributions', verifyAuth, async (req, res) => {
  res.send(await DB.getContributions(req.user.email));
});

apiRouter.post('/contributions', verifyAuth, async (req, res) => {
  const { date, type, amount } = req.body;
  const value = Number(amount);
  if (!type || !value || value <= 0) {
    return res.status(400).send({ msg: 'Type and a positive amount are required' });
  }
  const entry = {
    id: uuid.v4(),
    owner: req.user.email,
    date: date || new Date().toISOString().slice(0, 10),
    type,
    amount: value,
  };
  await DB.addContribution(entry);

  // Tell every connected client about the (anonymized) savings event
  broadcast({ type: 'savings_event', amount: value, created: new Date().toISOString() });

  res.send(entry);
});

// Third-party API proxy: the frontend calls us, we call dogapi.dog
apiRouter.get('/dogfact', async (_req, res) => {
  try {
    const response = await fetch('https://dogapi.dog/api/v2/facts');
    if (!response.ok) {
      throw new Error(`dogapi.dog responded with ${response.status}`);
    }
    const data = await response.json();
    const fact = data?.data?.[0]?.attributes?.body || 'Dogs are awesome.';
    res.send({ fact });
  } catch (err) {
    console.error(`Dog fact proxy failed: ${err.message}`);
    res.status(502).send({ msg: 'Could not reach the dog fact service' });
  }
});

// Unknown API routes
apiRouter.use((_req, res) => {
  res.status(404).send({ msg: 'Unknown API endpoint' });
});

// Async errors end up here instead of crashing the process
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send({ msg: 'Server error' });
});

// SPA fallback: return the frontend for any other route
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// WebSocket live feed on /ws
const { broadcast } = peerProxy(httpService);
