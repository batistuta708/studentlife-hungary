const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/User");

let counter = 0;

// Registers a real user through the actual API (not a DB shortcut), then promotes
// their role directly in the database — role changes go through the admin API in
// real usage, but bootstrapping the *first* admin/editor for a test has to bypass
// that chicken-and-egg requirement somehow.
async function createAuthedUser(role = "student") {
  counter += 1;
  const email = `user${counter}-${Date.now()}@example.com`;
  const res = await request(app).post("/api/v1/auth/register").send({
    name: `Test ${role}`,
    email,
    password: "password123",
  });

  if (role !== "student") {
    await User.findByIdAndUpdate(res.body.data.user._id, { role });
  }

  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken,
    email,
  };
}

module.exports = { createAuthedUser };
