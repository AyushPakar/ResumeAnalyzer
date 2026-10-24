import crypto from "crypto";
import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import JobMatch from "../models/Jobmatch.model.js";
import { matchResumeToJob } from "./gemini.service.js";

const MIN_CHARS = 50;
const MAX_CHARS = 10000;

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

const hashText = (text) =>
  crypto
    .createHash("sha256")
    .update(text.replace(/\s+/g, " ").toLowerCase())
    .digest("hex");
export async function matchResumeWithJob(resumeId, rawJobDescription, userId) {
  if (!mongoose.isValidObjectId(resumeId)) {
    throw httpError(400, "Invalid resume id");
  }

  const jobDescription = String(rawJobDescription ?? "").trim();
  if (jobDescription.length < MIN_CHARS) {
    throw httpError(
      400,
      "Please paste a longer job description (at least 50 characters).",
    );
  }
  if (jobDescription.length > MAX_CHARS) {
    throw httpError(
      400,
      "The job description is too long (maximum 10,000 characters).",
    );
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });
  if (!resume) throw httpError(404, "Resume not found");
  if (resume.status !== "completed" || !resume.analysis) {
    throw httpError(409, "This resume has not finished analyzing yet.");
  }

  // Same resume + same job description: reuse the saved result (no API call)
  const jdHash = hashText(jobDescription);
  const existing = await JobMatch.findOne({ resume: resume._id, jdHash });
  if (existing) return existing;

  // Send the already-extracted data, not the file again: faster and cheaper.
  // Name, email and phone are left out on purpose; matching doesn't need them.
  const { candidate, education, skills, experience, projects, certifications } =
    resume.analysis;

  const result = await matchResumeToJob({
    resumeData: {
      candidate: {
        currentRole: candidate?.currentRole,
        targetRole: candidate?.targetRole,
      },
      education,
      skills,
      experience,
      projects,
      certifications,
    },
    jobDescription,
  });

  try {
    return await JobMatch.create({
      resume: resume._id,
      jobDescription,
      jdHash,
      result,
    });
  } catch (err) {
    // Two identical requests at once (e.g. a double click): return the winner
    if (err.code === 11000)
      return JobMatch.findOne({ resume: resume._id, jdHash });
    throw err;
  }
}

export default JobMatch;
