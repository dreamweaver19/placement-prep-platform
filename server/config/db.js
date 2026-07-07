const mongoose = require('mongoose');
const dns = require('dns');

const configureDnsForAtlas = (mongoUri) => {
  if (!mongoUri.startsWith('mongodb+srv://')) return;

  const configuredServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : ['8.8.8.8', '1.1.1.1'];

  if (configuredServers.length > 0) {
    dns.setServers(configuredServers);
  }
};

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<')) {
    throw new Error('Set MONGO_URI in server/.env to a valid MongoDB connection string');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Set JWT_SECRET in server/.env before starting the server');
  }

  try {
    configureDnsForAtlas(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
};

module.exports = connectDB;
