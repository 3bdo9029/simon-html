const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('sidepot');
const userCollection = db.collection('user');
const plannerCollection = db.collection('planner');
const contributionCollection = db.collection('contribution');

// Test the connection on startup. Log failures but keep serving —
// endpoints will surface errors if the database stays unreachable.
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log('Connected to database');
  } catch (ex) {
    console.log(`Unable to connect to database with ${config.hostname} because ${ex.message}`);
  }
})();

function getUser(email) {
  return userCollection.findOne({ email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

function getPlannerItems(email) {
  return plannerCollection.find({ owner: email }).sort({ created: -1 }).toArray();
}

async function addPlannerItem(item) {
  await plannerCollection.insertOne(item);
}

function getContributions(email) {
  return contributionCollection.find({ owner: email }).sort({ date: -1 }).toArray();
}

async function addContribution(entry) {
  await contributionCollection.insertOne(entry);
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getPlannerItems,
  addPlannerItem,
  getContributions,
  addContribution,
};
