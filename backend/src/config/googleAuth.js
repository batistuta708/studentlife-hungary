const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verifies the ID token the frontend gets from Google Sign-In and returns the
// verified payload (email, name, picture, sub). Throws if the token is invalid,
// expired, or wasn't issued for our client ID — never trust an unverified token.
async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

module.exports = { verifyGoogleToken };
