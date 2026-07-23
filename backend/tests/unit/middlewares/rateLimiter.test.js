// The main suite runs with rate limiting disabled (see middlewares/rateLimiter.js —
// skipped when NODE_ENV=test) so its own 429s don't cause unrelated cascading
// failures elsewhere. This file explicitly re-enables it to verify the limiter itself
// still works, using its own tiny standalone app rather than the full app.js so it
// doesn't inherit the "skip in test" behavior. It simulates NODE_ENV=production
// specifically, since that's the strict-cap (10/15min) environment — development
// intentionally gets a much more generous cap so local/e2e testing doesn't trip it.
const express = require("express");
const request = require("supertest");

describe("Rate limiter (forced on, production cap)", () => {
  let app;

  beforeAll(() => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production"; // temporarily defeat the test-env skip, use the strict cap
    jest.resetModules(); // force rateLimiter.js to re-evaluate isProdEnv/isTestEnv on next require
    const { authLimiter } = require("../../../src/middlewares/rateLimiter");
    process.env.NODE_ENV = originalEnv;

    app = express();
    app.get("/probe", authLimiter, (req, res) => res.json({ ok: true }));
    app.use(require("../../../src/middlewares/error").errorHandler);
  });

  it("allows requests under the limit", async () => {
    const res = await request(app).get("/probe");
    expect(res.status).toBe(200);
  });

  it("returns 429 once the production limit (10 requests / 15 min) is exceeded", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).get("/probe");
    }
    const res = await request(app).get("/probe");
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many attempts/i);
  });
});
