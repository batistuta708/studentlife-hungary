const request = require("supertest");
const app = require("../../src/app");

describe("Auth endpoints", () => {
  const validUser = { name: "Test Student", email: "student@example.com", password: "password123" };

  describe("POST /api/v1/auth/register", () => {
    it("creates a new account and returns a user + accessToken", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.accessToken).toEqual(expect.any(String));
    });

    it("sets an httpOnly refreshToken cookie", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(validUser);
      const cookies = res.headers["set-cookie"];
      expect(cookies.some((c) => c.startsWith("refreshToken=") && c.includes("HttpOnly"))).toBe(true);
    });

    it("rejects a duplicate email with 409", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const res = await request(app).post("/api/v1/auth/register").send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects a weak password with a validation error", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, email: "weak@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "password")).toBe(true);
    });

    it("rejects an invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, email: "not-an-email" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
    });

    it("rejects an incorrect password with 401", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: validUser.email, password: "wrong-password" });

      expect(res.status).toBe(401);
    });

    it("rejects a non-existent email with 401 (not 404 — avoids account enumeration)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("issues a new access token given a valid refresh cookie", async () => {
      const registerRes = await request(app).post("/api/v1/auth/register").send(validUser);
      const cookie = registerRes.headers["set-cookie"];

      const refreshRes = await request(app).post("/api/v1/auth/refresh-token").set("Cookie", cookie);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toEqual(expect.any(String));
    });

    it("rejects when no refresh cookie is present", async () => {
      const res = await request(app).post("/api/v1/auth/refresh-token");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/users/me", () => {
    it("rejects with 401 when no token is provided", async () => {
      const res = await request(app).get("/api/v1/users/me");
      expect(res.status).toBe(401);
    });

    it("returns the current user's profile with a valid access token", async () => {
      const registerRes = await request(app).post("/api/v1/auth/register").send(validUser);
      const { accessToken } = registerRes.body.data;

      const res = await request(app).get("/api/v1/users/me").set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });
  });
});
