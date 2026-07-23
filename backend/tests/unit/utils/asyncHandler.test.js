const asyncHandler = require("../../../src/utils/asyncHandler");

describe("asyncHandler", () => {
  it("calls the wrapped function with req, res, next", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it("forwards a thrown/rejected error to next() instead of throwing", async () => {
    const error = new Error("boom");
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);
    const next = jest.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
