const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

// Test suites legitimately fire many more requests per second than any real user ever
// would — without this, the limiter (correctly!) kicks in mid-test-run and produces
// failures that have nothing to do with the behavior actually being tested. Skipping
// it in test env is standard practice; it stays fully active in development/production.
const isTestEnv = process.env.NODE_ENV === "test";
const isProdEnv = process.env.NODE_ENV === "production";

// General API limiter — generous, protects against scraping/abuse without hurting normal use.
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: (req, res, next) => next(new ApiError(429, "Too many requests, please try again later.")),
});

// Tighter limiter for sensitive auth endpoints (login, register, forgot-password) to
// slow down credential-stuffing / brute-force attempts. 10/15min is appropriately
// strict for production, but the same limit against a local dev server gets tripped
// fast by nothing more suspicious than a developer manually testing plus running the
// Playwright suite a few times in the same session — neither is an attack. Only
// production gets the strict cap; development gets a much more generous one so local
// testing isn't fighting its own safety feature.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProdEnv ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: (req, res, next) =>
    next(new ApiError(429, "Too many attempts. Please try again in 15 minutes.")),
});

module.exports = { apiLimiter, authLimiter };
