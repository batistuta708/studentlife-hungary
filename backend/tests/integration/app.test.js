const request = require("supertest");
const app = require("../../src/app");

describe("App-level behavior", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns a consistent 404 shape for unknown routes", async () => {
    const res = await request(app).get("/api/v1/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, statusCode: 404 });
  });

  it("returns a consistent error shape for an invalid Mongo ObjectId (CastError)", async () => {
    const res = await request(app).get("/api/v1/categories/not-a-valid-id");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
