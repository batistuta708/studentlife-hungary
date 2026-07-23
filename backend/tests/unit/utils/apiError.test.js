const ApiError = require("../../../src/utils/ApiError");

describe("ApiError", () => {
  it("sets statusCode, message, and success=false", () => {
    const err = new ApiError(404, "Not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.success).toBe(false);
    expect(err.isOperational).toBe(true);
  });

  it("carries field-level errors when provided", () => {
    const err = ApiError.badRequest("Validation failed", [{ field: "email", message: "Invalid" }]);
    expect(err.statusCode).toBe(400);
    expect(err.errors).toHaveLength(1);
  });

  it.each([
    ["badRequest", 400],
    ["unauthorized", 401],
    ["forbidden", 403],
    ["notFound", 404],
    ["conflict", 409],
    ["internal", 500],
  ])("static %s() produces status %i", (method, expectedStatus) => {
    const err = ApiError[method]();
    expect(err.statusCode).toBe(expectedStatus);
  });
});
