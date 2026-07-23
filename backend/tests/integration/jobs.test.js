const request = require("supertest");
const app = require("../../src/app");
const { createAuthedUser } = require("../helpers/auth");

async function submitJob(accessToken, overrides = {}) {
  return request(app)
    .post("/api/v1/jobs")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      title: "Barista at Cafe Frei",
      company: { name: "Cafe Frei" },
      description: "Part-time barista position near ELTE.",
      location: { city: "Budapest" },
      employmentType: "part-time",
      ...overrides,
    });
}

describe("Job endpoints", () => {
  it("allows any authenticated (student) user to submit a job — defaults to pending", async () => {
    const { accessToken } = await createAuthedUser("student");
    const res = await submitJob(accessToken);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("pending");
  });

  it("rejects submission from an unauthenticated request", async () => {
    const res = await request(app).post("/api/v1/jobs").send({ title: "No Auth Job" });
    expect(res.status).toBe(401);
  });

  it("hides pending jobs from the public list", async () => {
    const { accessToken } = await createAuthedUser("student");
    await submitJob(accessToken);

    const res = await request(app).get("/api/v1/jobs");
    expect(res.body.data).toHaveLength(0);
  });

  it("a student cannot approve their own job listing", async () => {
    const { accessToken } = await createAuthedUser("student");
    const created = await submitJob(accessToken);

    const res = await request(app)
      .patch(`/api/v1/jobs/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
  });

  it("an admin can approve a job, making it publicly visible", async () => {
    const student = await createAuthedUser("student");
    const admin = await createAuthedUser("admin");
    const created = await submitJob(student.accessToken);

    const approveRes = await request(app)
      .patch(`/api/v1/jobs/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "approved" });
    expect(approveRes.status).toBe(200);

    const publicList = await request(app).get("/api/v1/jobs");
    expect(publicList.body.data).toHaveLength(1);
  });

  it("the owner can edit their own pending listing", async () => {
    const { accessToken } = await createAuthedUser("student");
    const created = await submitJob(accessToken);

    const res = await request(app)
      .patch(`/api/v1/jobs/${created.body.data._id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Updated Barista Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Barista Title");
  });

  it("a different student cannot edit someone else's listing", async () => {
    const owner = await createAuthedUser("student");
    const intruder = await createAuthedUser("student");
    const created = await submitJob(owner.accessToken);

    const res = await request(app)
      .patch(`/api/v1/jobs/${created.body.data._id}`)
      .set("Authorization", `Bearer ${intruder.accessToken}`)
      .send({ title: "Hijacked Title" });

    expect(res.status).toBe(403);
  });

  it("rejects an invalid employmentType at the validation layer", async () => {
    const { accessToken } = await createAuthedUser("student");
    const res = await submitJob(accessToken, { employmentType: "not-a-real-type" });
    expect(res.status).toBe(400);
  });

  it("supports filtering by city and employmentType together", async () => {
    const student = await createAuthedUser("student");
    const admin = await createAuthedUser("admin");

    const budapestJob = await submitJob(student.accessToken, { title: "Budapest Barista" });
    const szegedJob = await submitJob(student.accessToken, {
      title: "Szeged Tutor",
      location: { city: "Szeged" },
      employmentType: "freelance",
    });

    await request(app)
      .patch(`/api/v1/jobs/${budapestJob.body.data._id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "approved" });
    await request(app)
      .patch(`/api/v1/jobs/${szegedJob.body.data._id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "approved" });

    const res = await request(app).get("/api/v1/jobs").query({ "location.city": "Budapest", employmentType: "part-time" });

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Budapest Barista");
  });
});
