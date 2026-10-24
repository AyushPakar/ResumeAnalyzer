import express from "express";
import cors from "cors";
import resumeRouter from "./routes/resume.route.js";
import historyRouter from "./routes/history.route.js";
import authRouter from "./routes/auth.route.js";
import settingRouter from "./routes/settings.route.js";

const app = express();

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/history", historyRouter);
app.use("/api/auth", authRouter);
app.use("/api/settings", settingRouter);
app.use("/api", resumeRouter);

app.use((err, req, res, next) => {
  const message =
    err.code === "LIMIT_FILE_SIZE"
      ? "File too large. Maximum size is 5MB."
      : err.message;
  res.status(400).json({ success: false, message });
});

export default app;
