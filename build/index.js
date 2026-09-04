const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');

const app = express();

const authCookieName = 'token';

// The service port. In production the frontend is statically hosted by this service.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// In-memory data until the database milestone
const users = [];
const plannerItems = new Map(); // email -> [{id, text, created}]
const contributions = new Map(); // email -> [{id, date, type, amount}]

// JSON body parsing
app.use(express.json());

// Cookie parsing for auth tokens
app.use(cookieParser());

// Serve the built frontend
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

function getUser(field, value) {
  return users.find((u) => u[field] === value);
}

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
  if (getUser('email', username)) {
    return res.status(409).send({ msg: 'A user with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email: username, passwordHash, token: uuid.v4() };
  users.push(user);

  setAuthCookie(res, user.token);
  res.send({ msg: 'Account created', email: user.email });
});

// Login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = getUser('email', username);
  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    return res.send({ msg: 'Logged in', email: user.email });
  }
  res.status(401).send({ msg: 'Invalid email or password' });
});

// Logout
apiRouter.post('/auth/logout', (req, res) => {
  const user = getUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Who am I?
apiRouter.get('/auth/me', (req, res) => {
  const user = getUser('token', req.cookies[authCookieName]);
  if (user) {
    return res.send({ authenticated: true, username: user.email });
  }
  res.send({ authenticated: false });
});

// Middleware: everything below requires authentication
function verifyAuth(req, res, next) {
  const user = getUser('token', req.cookies[authCookieName]);
  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  req.user = user;
  next();
}

// Planner items
apiRouter.get('/planner', verifyAuth, (req, res) => {
  res.send(plannerItems.get(req.user.email) || []);
});

apiRouter.post('/planner', verifyAuth, (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).send({ msg: 'Text is required' });
  }
  const item = { id: uuid.v4(), text, created: new Date().toISOString() };
  const items = plannerItems.get(req.user.email) || [];
  plannerItems.set(req.user.email, [item, ...items]);
  res.send(item);
});

// Contributions
apiRouter.get('/contributions', verifyAuth, (req, res) => {
  res.send(contributions.get(req.user.email) || []);
});

apiRouter.post('/contributions', verifyAuth, (req, res) => {
  const { date, type, amount } = req.body;
  const value = Number(amount);
  if (!type || !value || value <= 0) {
    return res.status(400).send({ msg: 'Type and a positive amount are required' });
  }
  const entry = {
    id: uuid.v4(),
    date: date || new Date().toISOString().slice(0, 10),
    type,
    amount: value,
  };
  const list = contributions.get(req.user.email) || [];
  contributions.set(req.user.email, [entry, ...list]);
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
    console.error('Dog fact proxy failed', err);
    res.status(502).send({ msg: 'Could not reach the dog fact service' });
  }
});

// Unknown API routes
apiRouter.use((_req, res) => {
  res.status(404).send({ msg: 'Unknown API endpoint' });
});

// SPA fallback: return the frontend for any other route
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
