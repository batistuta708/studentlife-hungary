/**
 * Wraps a Mongoose Query and a raw Express req.query object, applying REST-friendly
 * filtering/search/sort/pagination conventions shared by every list endpoint:
 *
 *   GET /api/v1/jobs?location.city=Budapest&employmentType=part-time
 *   GET /api/v1/jobs?search=barista
 *   GET /api/v1/jobs?sort=-createdAt,title
 *   GET /api/v1/jobs?fields=title,slug,location
 *   GET /api/v1/jobs?page=2&limit=20
 *   GET /api/v1/jobs?salary[gte]=2000&salary[lte]=5000
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query, e.g. Job.find()
    this.queryString = queryString; // req.query
    this.totalQuery = null; // set in paginate() so controllers can get a total count
  }

  search(searchableTextIndexFields = true) {
    if (this.queryString.search) {
      if (searchableTextIndexFields) {
        // Relies on a `text` index defined on the model (see Phase 2 schema docs).
        this.query = this.query.find(
          { $text: { $search: this.queryString.search } },
          { score: { $meta: "textScore" } }
        );
        this.query = this.query.sort({ score: { $meta: "textScore" } });
      }
    }
    return this;
  }

  filter() {
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => delete queryObj[field]);

    // Supports gte/gt/lte/lt operators, e.g. ?price[gte]=1000
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100); // hard cap at 100
    const skip = (page - 1) * limit;

    this.pagination = { page, limit, skip };
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
