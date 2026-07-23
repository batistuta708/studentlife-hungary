const { User } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail } = require("../services/email.service");
const { verifyGoogleToken } = require("../config/googleAuth");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRawToken,
  hashToken,
  refreshCookieOptions,
} = require("../services/token.service");

// Shared by register/login/googleLogin — issues a token pair, persists the refresh
// token on the user (supports multi-device sessions + selective logout), and sets the
// refresh token as an httpOnly cookie so it's never exposed to frontend JS.
async function issueSession(user, res) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // cap at 5 devices
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  return accessToken;
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const { raw, hashed } = generateRawToken();

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
    emailVerificationToken: hashed,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendEmail({
    to: email,
    subject: "Verify your StudentLife Hungary account",
    html: `<p>Welcome! Please verify your email by clicking <a href="${verifyUrl}">this link</a>. It expires in 24 hours.</p>`,
  }).catch(() => null); // don't block registration on a transient email failure

  const accessToken = await issueSession(user, res);
  new ApiResponse(201, { user, accessToken }, "Account created — please verify your email").send(res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || user.authProvider !== "local" || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  const accessToken = await issueSession(user, res);
  new ApiResponse(200, { user, accessToken }, "Logged in successfully").send(res);
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw ApiError.badRequest("idToken is required");

  const payload = await verifyGoogleToken(idToken);
  if (!payload?.email) throw ApiError.unauthorized("Invalid Google token");

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      googleId: payload.sub,
      authProvider: "google",
      isEmailVerified: true, // Google has already verified this email
      avatar: payload.picture ? { url: payload.picture } : undefined,
    });
  } else if (!user.googleId) {
    // Existing local account signing in with Google for the first time — link accounts.
    user.googleId = payload.sub;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const accessToken = await issueSession(user, res);
  new ApiResponse(200, { user, accessToken }, "Logged in with Google").send(res);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized("No refresh token provided");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(token)) {
    throw ApiError.unauthorized("Refresh token not recognized — please log in again");
  }

  // Rotate: invalidate the used refresh token and issue a fresh pair. Rotation limits
  // the damage if a refresh token is ever stolen — it can only be used once.
  const newRefreshToken = signRefreshToken(user._id);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-5);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());
  const accessToken = signAccessToken(user._id);
  new ApiResponse(200, { accessToken }).send(res);
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
  }
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  new ApiResponse(200, null, "Logged out").send(res);
});

exports.logoutAllDevices = asyncHandler(async (req, res) => {
  req.user.refreshTokens = [];
  await req.user.save({ validateBeforeSave: false });
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  new ApiResponse(200, null, "Logged out of all devices").send(res);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashed = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) throw ApiError.badRequest("Invalid or expired verification link");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  new ApiResponse(200, null, "Email verified successfully").send(res);
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.isEmailVerified) throw ApiError.badRequest("Email is already verified");

  const { raw, hashed } = generateRawToken();
  user.emailVerificationToken = hashed;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your StudentLife Hungary account",
    html: `<p>Click <a href="${verifyUrl}">this link</a> to verify your email. It expires in 24 hours.</p>`,
  });

  new ApiResponse(200, null, "Verification email sent").send(res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, authProvider: "local" });

  // Always return the same response whether or not the email exists, so this endpoint
  // can't be used to enumerate registered accounts.
  if (user) {
    const { raw, hashed } = generateRawToken();
    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
    await sendEmail({
      to: email,
      subject: "Reset your StudentLife Hungary password",
      html: `<p>Click <a href="${resetUrl}">this link</a> to reset your password. It expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    }).catch(() => null);
  }

  new ApiResponse(200, null, "If that email is registered, a reset link has been sent").send(res);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw ApiError.badRequest("Invalid or expired reset link");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // invalidate every existing session as a security precaution
  await user.save();

  new ApiResponse(200, null, "Password reset successfully — please log in again").send(res);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (user.authProvider !== "local") {
    throw ApiError.badRequest("This account uses Google Sign-In and has no password to change");
  }
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all other devices
  await user.save();

  new ApiResponse(200, null, "Password changed — please log in again").send(res);
});
