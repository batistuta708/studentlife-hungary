const { Analytics, User, Article, Job, Accommodation, Scholarship, Comment } = require("../models");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Fire-and-forget style endpoint the frontend calls to log a pageview/search/etc.
exports.track = asyncHandler(async (req, res) => {
  const { eventType, targetType, targetId, meta } = req.body;

  await Analytics.create({
    eventType,
    targetType: targetType || null,
    targetId: targetId || null,
    user: req.user?._id || null,
    sessionId: req.cookies?.sid || req.headers["x-session-id"],
    meta,
  });

  new ApiResponse(201, null).send(res);
});

// Powers the "Dashboard Analytics" admin screen: headline counts + a 30-day events-per-day
// series built with an aggregation pipeline rather than pre-defined counters.
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalArticles,
    publishedArticles,
    totalJobs,
    pendingJobs,
    totalAccommodation,
    pendingAccommodation,
    totalScholarships,
    pendingComments,
    eventsPerDay,
    topArticles,
  ] = await Promise.all([
    User.countDocuments(),
    Article.countDocuments(),
    Article.countDocuments({ status: "published" }),
    Job.countDocuments(),
    Job.countDocuments({ status: "pending" }),
    Accommodation.countDocuments(),
    Accommodation.countDocuments({ status: "pending" }),
    Scholarship.countDocuments(),
    Comment.countDocuments({ status: "pending" }),
    Analytics.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, eventType: "$eventType" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]),
    Article.find({ status: "published" }).sort("-views").limit(5).select("title slug views likesCount"),
  ]);

  new ApiResponse(200, {
    counts: {
      totalUsers,
      totalArticles,
      publishedArticles,
      totalJobs,
      pendingJobs,
      totalAccommodation,
      pendingAccommodation,
      totalScholarships,
      pendingComments,
    },
    eventsPerDay,
    topArticles,
  }).send(res);
});
