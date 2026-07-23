const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

// Runs once before the whole suite: boots an actual (in-memory) MongoDB instance so
// integration tests exercise real Mongoose behavior — validation, hooks, indexes,
// unique constraints — rather than mocking the database, which would let bugs like
// the Phase 4 `refreshTokens` schema issue slip through silently.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Test-only secrets so auth-related tests don't depend on a real .env file.
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-access-secret";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
  process.env.JWT_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "30d";
  process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
  process.env.NODE_ENV = "test";
});

// Clears all collections between individual test files' test cases so tests don't leak
// state into each other, without paying the cost of tearing down/recreating the server.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
