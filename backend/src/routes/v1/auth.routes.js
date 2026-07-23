const router = require("express").Router();
const ctrl = require("../../controllers/auth.controller");
const { protect } = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { authLimiter } = require("../../middlewares/rateLimiter");
const v = require("../../validators/auth.validator");

// All sensitive auth endpoints share the strict rate limiter to slow down brute-force /
// credential-stuffing attempts (see middlewares/rateLimiter.js).
router.post("/register", authLimiter, v.register, validate, ctrl.register);
router.post("/login", authLimiter, v.login, validate, ctrl.login);
router.post("/google", authLimiter, v.googleLogin, validate, ctrl.googleLogin);
router.post("/refresh-token", ctrl.refreshToken);
router.post("/logout", ctrl.logout);
router.post("/logout-all", protect, ctrl.logoutAllDevices);

router.post("/verify-email", v.verifyEmail, validate, ctrl.verifyEmail);
router.post("/resend-verification", protect, ctrl.resendVerification);

router.post("/forgot-password", authLimiter, v.forgotPassword, validate, ctrl.forgotPassword);
router.post("/reset-password", authLimiter, v.resetPassword, validate, ctrl.resetPassword);
router.post("/change-password", protect, v.changePassword, validate, ctrl.changePassword);

module.exports = router;
