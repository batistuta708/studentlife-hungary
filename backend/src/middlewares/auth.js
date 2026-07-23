const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");

// Verifies the access token and attaches `req.user`. Full login/register/refresh-token
// issuance is implemented in Phase 4 — this middleware only consumes tokens, it doesn't
// create them, so write-protected CRUD routes in this phase have something to depend on.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User no longer exists or is disabled");
  }

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never rejects the request —
// used on public routes that personalize output (e.g. "is this article bookmarked by me").
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch (err) {
      // Invalid/expired token on an optional route — proceed as an anonymous request.
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
