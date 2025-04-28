const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
console.log("databaseUrl",process.env.DATABASE_URL);
let databaseUrl =
  process.env.DATABASE_URL 
console.log("dataBase url",databaseUrl);
// Connect to MongoDB with a connection pool
mongoose.connect(databaseUrl, {
  maxPoolSize: 10, // Adjust based on your needs
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(-1);
});

db.once('open', () => {
  console.log('MongoDB connected successfully');
});

// Function to get server time from MongoDB
const getDateTime = async () => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.command({ serverStatus: 1 });
    return { now: serverStatus.localTime };
  } catch (err) {
    console.error('Error fetching server time:', err);
  }
};

module.exports = { getDateTime };
