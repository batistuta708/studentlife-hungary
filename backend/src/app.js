const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const v1Routes = require("./routes/v1");
const { errorHandler, notFoundHandler } = require("./middlewares/error");
const { apiLimiter } = require("./middlewares/rateLimiter");
const logger = require("./config/logger");

const app = express();

// --- Security headers ---
app.use(helmet());

// --- CORS: only the configured frontend origin may call the API with credentials ---
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// --- Body/cookie parsing ---
app.use(express.json({ limit: "10kb" })); // caps payload size against DoS-by-large-body
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --- Sanitization against NoSQL injection and XSS ---
app.use(mongoSanitize());
app.use(xss());
app.use(hpp()); // prevents HTTP parameter pollution (?sort=a&sort=b tricks)

// --- Performance ---
app.use(compression());

// --- Logging ---
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.http?.(message.trim()) || logger.info(message.trim()) },
  })
);

// --- Rate limiting on all /api routes ---
app.use("/api", apiLimiter);

// --- Health check for Render/uptime monitors ---
app.get("/health", (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));

// --- API routes ---
app.use("/api/v1", v1Routes);

// --- 404 + centralized error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
