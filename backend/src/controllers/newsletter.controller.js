const crypto = require("crypto");
const { Newsletter } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail } = require("../services/email.service");

exports.subscribe = asyncHandler(async (req, res) => {
  const { email, interests = [] } = req.body;

  let subscriber = await Newsletter.findOne({ email });
  if (subscriber && subscriber.status === "subscribed") {
    throw ApiError.conflict("This email is already subscribed");
  }

  const confirmToken = crypto.randomBytes(20).toString("hex");

  if (!subscriber) {
    subscriber = await Newsletter.create({ email, interests, confirmToken, status: "pending" });
  } else {
    subscriber.confirmToken = confirmToken;
    subscriber.status = "pending";
    subscriber.interests = interests;
    await subscriber.save();
  }

  const confirmUrl = `${process.env.CLIENT_URL}/newsletter/confirm?token=${confirmToken}`;
  await sendEmail({
    to: email,
    subject: "Confirm your StudentLife Hungary newsletter subscription",
    html: `<p>Click <a href="${confirmUrl}">here</a> to confirm your subscription.</p>`,
  }).catch(() => null); // don't fail the request if email delivery has a transient issue

  new ApiResponse(201, null, "Confirmation email sent").send(res);
});

exports.confirm = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const subscriber = await Newsletter.findOne({ confirmToken: token }).select("+confirmToken");
  if (!subscriber) throw ApiError.badRequest("Invalid or expired confirmation link");

  subscriber.status = "subscribed";
  subscriber.subscribedAt = new Date();
  subscriber.confirmToken = undefined;
  await subscriber.save();

  new ApiResponse(200, null, "Subscription confirmed").send(res);
});

exports.unsubscribe = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
  if (!subscriber) throw ApiError.badRequest("Invalid unsubscribe link");

  subscriber.status = "unsubscribed";
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  new ApiResponse(200, null, "You have been unsubscribed").send(res);
});

// --- Admin ---
exports.getAllForAdmin = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const subscribers = await Newsletter.find(filter).sort("-createdAt");
  new ApiResponse(200, subscribers).send(res);
});

exports.removeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
  if (!subscriber) throw ApiError.notFound("Subscriber not found");
  new ApiResponse(200, null, "Subscriber removed").send(res);
});
