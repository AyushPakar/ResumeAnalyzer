// import crypto from "crypto";
// import Resume from "../models/resume.model.js";
// import { uploadToGridFS } from "./storage.service.js";
// import analyzeResume from "./gemini.service.js";

// const hashBuffer = (buffer) =>
//   crypto.createHash("sha256").update(buffer).digest("hex");

// // upload -> save file in GridFS -> send to Gemini -> save result in MongoDB
// export async function processResume(file) {
//   const fileHash = hashBuffer(file.buffer);

//   let resume = await Resume.findOne({ fileHash });

//   // Already analysed this exact file: return it. No storage, no API call,
//   // and it still works if Gemini is down.
//   if (resume?.status === "completed") return resume;

//   if (!resume) {
//     const fileId = await uploadToGridFS(
//       file.buffer,
//       file.originalname,
//       file.mimetype,
//     );
//     resume = await Resume.create({
//       fileId,
//       originalName: file.originalname,
//       mimeType: file.mimetype,
//       size: file.size,
//       fileHash,
//     });
//   } else {
//     // Earlier attempt failed or got interrupted: reuse the stored file and retry
//     resume.status = "processing";
//     resume.error = null;
//     await resume.save();
//   }

//   try {
//     resume.analysis = await analyzeResume({
//       buffer: file.buffer,
//       originalName: file.originalname,
//     });
//     resume.status = "completed";
//     await resume.save();
//     return resume;
//   } catch (err) {
//     resume.status = "failed";
//     resume.error = err.message;
//     await resume.save();
//     throw err; // controller turns this into the right HTTP response
//   }
// }

// export function getResumeById(id) {
//   return Resume.findById(id);
// }

// // Lightweight list for the History page (no big analysis payload)
// export function listResumes() {
//   return Resume.find()
//     .select("originalName status size createdAt")
//     .sort({ createdAt: -1 });
// }

import crypto from "crypto";
import Resume from "../models/resume.model.js";
import { uploadToGridFS } from "./storage.service.js";
import analyzeResume from "./gemini.service.js";

const hashBuffer = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

// Upload -> GridFS -> Gemini -> MongoDB
export async function processResume(file, userId) {
  const fileHash = hashBuffer(file.buffer);

  // Find duplicate only for this user
  let resume = await Resume.findOne({ fileHash, userId });

  if (resume?.status === "completed") return resume;

  if (!resume) {
    const fileId = await uploadToGridFS(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    resume = await Resume.create({
      userId,
      fileId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileHash,
    });
  } else {
    resume.status = "processing";
    resume.error = null;
    await resume.save();
  }

  try {
    resume.analysis = await analyzeResume({
      buffer: file.buffer,
      originalName: file.originalname,
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

// Fetch only the logged-in user's resume
export function getResumeById(id, userId) {
  return Resume.findOne({ _id: id, userId });
}

// List only the logged-in user's resumes
export function listResumes(userId) {
  return Resume.find({ userId })
    .select("originalName status size createdAt")
    .sort({ createdAt: -1 });
}
