import {
  processResume,
  getResumeById,
  listResumes,
} from "../services/resume.service.js";
import { matchResumeWithJob } from "../services/Jobmatch.service.js";

const resumeController = {
  async resumeUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a resume",
        });
      }

      const resume = await processResume(req.file, req.user._id);

      res.status(200).json({
        success: true,
        message: "Resume uploaded and analyzed successfully",
        resumeId: resume._id,
        filename: resume.originalName,
        analysis: resume.analysis,
      });
    } catch (error) {
      console.error("Resume analysis failed:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        retryable: Boolean(error.retryable),
      });
    }
  },

  async getResume(req, res) {
    try {
      const resume = await getResumeById(req.params.id, req.user._id);
      if (!resume) {
        return res
          .status(404)
          .json({ success: false, message: "Resume not found" });
      }
      res.status(200).json({ success: true, resume });
    } catch (error) {
      const status = error.name === "CastError" ? 400 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  async listResumes(req, res) {
    try {
      const resumes = await listResumes(req.user._id);
      res.status(200).json({ success: true, resumes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/resume/:id/match   body: { jobDescription }
  async matchJob(req, res) {
    try {
      const match = await matchResumeWithJob(
        req.params.id,
        req.body?.jobDescription,
        req.user._id,
      );
      res.status(200).json({
        success: true,
        matchId: match._id,
        result: match.result,
      });
    } catch (error) {
      console.error("Job match failed:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        retryable: Boolean(error.retryable),
      });
    }
  },

  async getATSData(req, res) {
    try {
      const resume = await getResumeById(req.params.id, req.user._id);

      if (!resume || !resume.analysis) {
        return res.status(404).json({
          success: false,
          message: "Resume analysis not found",
        });
      }

      return res.status(200).json({
        success: true,
        result: {
          atsScore: resume.analysis.atsScore,
          missingSkills: resume.analysis.missingSkills,
        },
      });
    } catch (error) {
      console.error("ATS data fetch failed:", error);

      return res.status(error.name === "CastError" ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default resumeController;
