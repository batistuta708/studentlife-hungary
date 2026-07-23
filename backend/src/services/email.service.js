const nodemailer = require("nodemailer");
const logger = require("../config/logger");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  // No SMTP server exists in a test run — attempting a real connection just produces
  // ECONNREFUSED noise and (worse) can leave a dangling socket/retry timer that stops
  // Jest from exiting cleanly. Controllers already treat email as best-effort
  // (Phase 4's `.catch(() => null)` on registration, for example), so this keeps that
  // contract while making test runs fast, quiet, and deterministic.
  if (process.env.NODE_ENV === "test") {
    logger.debug(`[test] Skipped sending email to ${to}: ${subject}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Email failures shouldn't crash the request that triggered them (e.g. a signup) —
    // log and let the caller decide whether it's fatal for that flow.
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
}

module.exports = { sendEmail };
