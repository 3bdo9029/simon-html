// database.js
const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

// IMPORTANT: use one client and connect once
const client = new MongoClient(url);
const db = client.db('startup');

const userCollection = db.collection('users');
const plannerCollection = db.collection('planner');
const scoreCollection = db.collection('scores');

const ready = (async () => {
  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`DB connected to ${config.hostname}`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    // don't exit; let routes return 503 via try/catch in index.js
  }
})();

// ---------- User functions ----------

// Accepts identifier as email OR username
async function getUser(identifier) {
  await ready;
  if (!identifier) return null;
  return userCollection.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
}

async function getUserByToken(token) {
  await ready;
  if (!token) return null;
  return userCollection.findOne({ token });
}

async function addUser(user) {
  await ready;
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await ready;
  // update by _id if present, else by email/username
  const filter =
    user._id ? { _id: user._id } : { $or: [{ email: user.email }, { username: user.username }] };

  const set = {
    email: user.email,
    username: user.username,
    password: user.password,
    token: user.token,
  };

  await userCollection.updateOne(filter, { $set: set }, { upsert: false });
}

// ---------- Scores (optional, for /scores + /score endpoints) ----------

async function addScore(score) {
  await ready;
  await scoreCollection.insertOne(score);
}

async function getHighScores() {
  await ready;
  return scoreCollection.find().sort({ score: -1 }).limit(10).toArray();
}

// ---------- Planner (keep what you had) ----------

async function getPlannerItems(username) {
  await ready;
  return plannerCollection.find({ username }).toArray();
}

async function addPlannerItem(item) {
  await ready;
  await plannerCollection.insertOne(item);
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addScore,
  getHighScores,
  getPlannerItems,
  addPlannerItem,
};
