const User = require("../../../src/models/User");

describe("User model", () => {
  it("hashes the password on save and never returns it on a subsequent query", async () => {
    const created = await User.create({ name: "Ada Lovelace", email: "ada@example.com", password: "plaintext123" });
    // select:false only takes effect on a fresh query — the in-memory document
    // .create() just returned still has it, since there's nothing to "re-fetch".
    expect(created.password).not.toBe("plaintext123"); // still hashed by the pre-save hook, though

    const requeried = await User.findById(created._id); // no .select("+password")
    expect(requeried.password).toBeUndefined(); // now correctly excluded

    const withPassword = await User.findById(created._id).select("+password");
    expect(withPassword.password).not.toBe("plaintext123");
    expect(withPassword.password.length).toBeGreaterThan(20); // bcrypt hash
  });

  it("comparePassword correctly validates the right and wrong password", async () => {
    await User.create({ name: "Grace Hopper", email: "grace@example.com", password: "correct-horse" });
    const user = await User.findOne({ email: "grace@example.com" }).select("+password");

    await expect(user.comparePassword("correct-horse")).resolves.toBe(true);
    await expect(user.comparePassword("wrong-password")).resolves.toBe(false);
  });

  it("refreshTokens is select:false by default but a real array once explicitly selected", async () => {
    // Regression test for the Phase 4 bug: `[{ type: String, select: false }]` was
    // mis-specified and could be interpreted as an array of subdocuments rather than
    // a select:false array of strings. This confirms the corrected schema behaves.
    const user = await User.create({ name: "Test User", email: "reg@example.com", password: "password123" });
    user.refreshTokens.push("some-refresh-token");
    await user.save({ validateBeforeSave: false });

    const withoutSelect = await User.findById(user._id);
    expect(withoutSelect.refreshTokens).toBeUndefined(); // excluded entirely, not an empty array

    const withSelect = await User.findById(user._id).select("+refreshTokens");
    expect(Array.isArray(withSelect.refreshTokens)).toBe(true);
    expect(withSelect.refreshTokens).toContain("some-refresh-token");
  });

  it("toJSON() strips password and token fields even if selected", async () => {
    const user = await User.create({ name: "Leaky Fields", email: "leaky@example.com", password: "password123" });
    const withSensitive = await User.findById(user._id).select("+password +refreshTokens");
    const json = withSensitive.toJSON();

    expect(json.password).toBeUndefined();
    expect(json.refreshTokens).toBeUndefined();
  });

  it("rejects duplicate emails", async () => {
    await User.create({ name: "First", email: "dup@example.com", password: "password123" });
    await expect(User.create({ name: "Second", email: "dup@example.com", password: "password123" })).rejects.toThrow();
  });
});
