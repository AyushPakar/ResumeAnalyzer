import multer from "multer";
import path from "path";

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"));
  }
};

const upload = multer({
  // Keep the file in memory (req.file.buffer) instead of writing to src/uploads.
  // It goes straight to GridFS, so nothing is ever saved on the server's disk.
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches your UI
});

export default upload;
