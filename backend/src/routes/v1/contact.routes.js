const router = require("express").Router();
const ctrl = require("../../controllers/contact.controller");
const { authLimiter } = require("../../middlewares/rateLimiter");

// Reuses the stricter auth-endpoint rate limiter — a public unauthenticated form is
// exactly the kind of endpoint spam bots target.
router.post("/", authLimiter, ctrl.submit);

module.exports = router;
