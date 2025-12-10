// service/database.js
const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

// Build the Atlas connection URL just like in the Simon DB example
const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

// Create the client and choose a database name for your startup
const client = new MongoClient(url);
const db = client.db('startup'); // you can change 'startup' to 'sidepot' if you want

// Collections
const userCollection = db.collection('users');
const plannerCollection = db.collection('planner');

// Test the connection on startup
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`DB connected to ${config.hostname}`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// ----- User functions (auth data in Mongo) -----

function getUser(username) {
  // Returns a single user document or null
  return userCollection.findOne({ username });
}

async function addUser(user) {
  // user = { username, passwordHash }
  await userCollection.insertOne(user);
}

// ----- Planner functions (app data in Mongo) -----

function getPlannerItems(username) {
  return plannerCollection.find({ username }).toArray();
}

async function addPlannerItem(item) {
  // item = { id, username, text, created }
  await plannerCollection.insertOne(item);
}

module.exports = {
  getUser,
  addUser,
  getPlannerItems,
  addPlannerItem,
};
