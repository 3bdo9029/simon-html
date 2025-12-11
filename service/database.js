// database.js
const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

// Build Atlas connection URL
const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

// Create client and DB
const client = new MongoClient(url);
const db = client.db('startup'); // you can rename to 'sidepot' if you want

// Collections
const userCollection = db.collection('users');
const plannerCollection = db.collection('planner');

// Test connection on startup
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`DB connected to ${config.hostname}`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// ----- User functions -----

function getUser(username) {
  return userCollection.findOne({ username });
}

async function addUser(user) {
  // user: { username, passwordHash }
  await userCollection.insertOne(user);
}

// ----- Planner functions -----

function getPlannerItems(username) {
  return plannerCollection.find({ username }).toArray();
}

async function addPlannerItem(item) {
  // item: { id, username, text, created }
  await plannerCollection.insertOne(item);
}

module.exports = {
  getUser,
  addUser,
  getPlannerItems,
  addPlannerItem,
};