import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import JobMatch from "./Jobmatch.service.js";
import analyzeResume from "./gemini.service.js";
import { downloadFromGridFS, deleteFromGridFS } from "./fileStorage.service.js";

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Only the fields the History table needs, newest first
export function listHistory(userId) {
  return Resume.find({ userId })
    .select(
      "originalName status size error createdAt analysis.atsScore analysis.candidate.targetRole",
    )
    .sort({ createdAt: -1 });
}

// Re-runs the analysis on the file that is already stored
export async function retryResume(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid resume id");

  const resume = await Resume.findById({ _id: id, userId });
  if (!resume) throw httpError(404, "Resume not found");
  if (resume.status === "completed") return resume;

  resume.status = "processing";
  resume.error = null;
  await resume.save();

  try {
    const buffer = await downloadFromGridFS(resume.fileId);
    resume.analysis = await analyzeResume({
      buffer,
      originalName: resume.originalName,
    });
    resume.status = "completed";
    await resume.save();
    return resume;
  } catch (err) {
    resume.status = "failed";
    resume.error = err.message;
    await resume.save();
    throw err;
  }
}

// Removes the file, the analysis and every job match saved for it
export async function deleteResume(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, "Invalid resume id");
  }

  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) throw httpError(404, "Resume not found");

  await deleteFromGridFS(resume.fileId);
  await JobMatch.deleteMany({ resume: resume._id });
  await resume.deleteOne();
}
