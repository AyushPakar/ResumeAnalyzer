import express from "express";
import upload from "../middlewares/upload.middleware.js";
import resumeController from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all resume endpoints
router.use(requireAuth);

// Upload resume
router.post(
  "/upload-resume",
  upload.single("resume"),
  resumeController.resumeUpload,
);

router.get("/", resumeController.listResumes);
router.get("/:id", resumeController.getResume);
router.post("/:id/match", resumeController.matchJob);
router.get("/:id/atsData", resumeController.getATSData);

export default router;
