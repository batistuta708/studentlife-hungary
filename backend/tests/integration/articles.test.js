const request = require("supertest");
const app = require("../../src/app");
const { createAuthedUser } = require("../helpers/auth");

async function createArticle(accessToken, overrides = {}) {
  return request(app)
    .post("/api/v1/articles")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      title: "Finding Student Housing in Budapest",
      excerpt: "A practical guide to the Budapest rental market.",
      content: "<p>Full guide content here.</p>",
      coverImage: { url: "https://example.com/cover.jpg" },
      ...overrides,
    });
}

describe("Article endpoints", () => {
  it("rejects article creation from a student (editor/admin only)", async () => {
    const { accessToken } = await createAuthedUser("student");
    const res = await createArticle(accessToken);
    expect(res.status).toBe(403);
  });

  it("allows an editor to create an article, defaulting to draft status", async () => {
    const { accessToken } = await createAuthedUser("editor");
    const res = await createArticle(accessToken);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("draft");
    expect(res.body.data.slug).toBe("finding-student-housing-in-budapest");
  });

  it("hides draft articles from public/anonymous visitors", async () => {
    const { accessToken } = await createAuthedUser("editor");
    await createArticle(accessToken);

    const res = await request(app).get("/api/v1/articles");
    expect(res.body.data).toHaveLength(0);
  });

  it("shows draft articles to editors/admins but not students", async () => {
    const editor = await createAuthedUser("editor");
    await createArticle(editor.accessToken);

    const asEditor = await request(app).get("/api/v1/articles").set("Authorization", `Bearer ${editor.accessToken}`);
    expect(asEditor.body.data).toHaveLength(1);

    const student = await createAuthedUser("student");
    const asStudent = await request(app).get("/api/v1/articles").set("Authorization", `Bearer ${student.accessToken}`);
    expect(asStudent.body.data).toHaveLength(0);
  });

  it("publishes an article and makes it publicly visible", async () => {
    const { accessToken } = await createAuthedUser("editor");
    const created = await createArticle(accessToken);

    await request(app)
      .patch(`/api/v1/articles/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "published" });

    const res = await request(app).get("/api/v1/articles");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("published");
  });

  it("increments the view counter when fetched by slug", async () => {
    const { accessToken } = await createAuthedUser("editor");
    const created = await createArticle(accessToken);
    await request(app)
      .patch(`/api/v1/articles/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "published" });

    const slug = created.body.data.slug;
    await request(app).get(`/api/v1/articles/${slug}`);
    const second = await request(app).get(`/api/v1/articles/${slug}`);

    expect(second.body.data.views).toBe(2);
  });

  it("toggles a like on and off", async () => {
    const editor = await createAuthedUser("editor");
    const created = await createArticle(editor.accessToken);
    const student = await createAuthedUser("student");

    const likeRes = await request(app)
      .post(`/api/v1/articles/${created.body.data._id}/like`)
      .set("Authorization", `Bearer ${student.accessToken}`);
    expect(likeRes.body.data).toEqual({ liked: true, likesCount: 1 });

    const unlikeRes = await request(app)
      .post(`/api/v1/articles/${created.body.data._id}/like`)
      .set("Authorization", `Bearer ${student.accessToken}`);
    expect(unlikeRes.body.data).toEqual({ liked: false, likesCount: 0 });
  });

  it("returns 404 for a non-existent slug", async () => {
    const res = await request(app).get("/api/v1/articles/does-not-exist");
    expect(res.status).toBe(404);
  });
});
