const mongoose = require("mongoose");
const Article = require("../../../src/models/Article");
const Job = require("../../../src/models/Job");
const University = require("../../../src/models/University");

async function makeUser() {
  const User = require("../../../src/models/User");
  return User.create({ name: "Author", email: `author-${Date.now()}@example.com`, password: "password123" });
}

describe("Automatic slug generation", () => {
  it("generates a URL-safe slug from an article title", async () => {
    const author = await makeUser();
    const article = await Article.create({
      title: "How to Open a Bank Account in Hungary!",
      excerpt: "A quick guide.",
      content: "<p>Content</p>",
      coverImage: { url: "https://example.com/cover.jpg" },
      author: author._id,
    });
    expect(article.slug).toBe("how-to-open-a-bank-account-in-hungary");
  });

  it("appends a uniqueness suffix for user-submitted content (Job)", async () => {
    const author = await makeUser();
    const job = await Job.create({
      title: "Barista Needed",
      company: { name: "Cafe Frei" },
      description: "Part-time barista position.",
      location: { city: "Budapest" },
      employmentType: "part-time",
      postedBy: author._id,
    });
    expect(job.slug).toMatch(/^barista-needed-[a-z0-9]+$/);
  });

  it("does not regenerate the slug on unrelated updates", async () => {
    const university = await University.create({
      name: "Test University",
      description: "A great school.",
      city: "Szeged",
    });
    const originalSlug = university.slug;

    university.description = "An even better school.";
    await university.save();

    expect(university.slug).toBe(originalSlug);
  });

  it("rejects duplicate slugs at the database level", async () => {
    await University.create({ name: "Duplicate Uni", description: "First", city: "Debrecen" });
    await expect(University.create({ name: "Duplicate Uni", description: "Second", city: "Pecs" })).rejects.toThrow();
  });
});
