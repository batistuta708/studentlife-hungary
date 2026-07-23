const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail } = require("../services/email.service");

// Contact submissions are forwarded straight to EMAIL_FROM (the same address used for
// transactional email) rather than stored in the database — there's no admin screen
// need to manage a "contact messages" collection, and email is simpler and sufficient
// for the volume a contact form like this actually gets.
exports.submit = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw ApiError.badRequest("Name, email, and message are all required");
  }

  await sendEmail({
    to: process.env.EMAIL_FROM,
    subject: `New contact form submission from ${name}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  }).catch(() => null); // best-effort — don't fail the user-facing request over an SMTP hiccup

  new ApiResponse(200, null, "Message sent — we'll get back to you soon").send(res);
});
