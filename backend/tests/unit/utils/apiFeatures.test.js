const ApiFeatures = require("../../../src/utils/apiFeatures");
const Category = require("../../../src/models/Category");

describe("ApiFeatures", () => {
  beforeEach(async () => {
    await Category.create([
      { name: "Visa & Permits", appliesTo: "article", order: 2 },
      { name: "Housing Tips", appliesTo: "article", order: 1 },
      { name: "Part-time Work", appliesTo: "job", order: 1 },
    ]);
  });

  it("filter() restricts results to matching fields", async () => {
    const features = new ApiFeatures(Category.find(), { appliesTo: "job" }).filter();
    const results = await features.query;
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Part-time Work");
  });

  it("sort() orders by the requested field", async () => {
    const features = new ApiFeatures(Category.find({ appliesTo: "article" }), { sort: "order" }).sort();
    const results = await features.query;
    expect(results.map((r) => r.name)).toEqual(["Housing Tips", "Visa & Permits"]);
  });

  it("defaults to -createdAt when no sort is given", async () => {
    const features = new ApiFeatures(Category.find(), {}).sort();
    expect(features.query.getOptions().sort).toEqual({ createdAt: -1 });
  });

  it("limitFields() selects only requested fields", async () => {
    const features = new ApiFeatures(Category.find({ appliesTo: "job" }), { fields: "name" }).limitFields();
    const [result] = await features.query;
    expect(result.name).toBeDefined();
    expect(result.description).toBeUndefined();
  });

  it("paginate() applies skip/limit and caps limit at 100", () => {
    const features = new ApiFeatures(Category.find(), { page: "2", limit: "500" }).paginate();
    expect(features.pagination).toEqual({ page: 2, limit: 100, skip: 100 });
  });

  it("paginate() defaults to page 1, limit 20", () => {
    const features = new ApiFeatures(Category.find(), {}).paginate();
    expect(features.pagination).toEqual({ page: 1, limit: 20, skip: 0 });
  });
});
