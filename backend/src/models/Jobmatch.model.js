import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobDescription: { type: String, required: true },
    // Hash of the cleaned-up job description, used to spot repeat requests
    jdHash: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

// One saved result per (resume, job description) pair
jobMatchSchema.index({ resume: 1, jdHash: 1 }, { unique: true });

export default mongoose.model("JobMatch", jobMatchSchema);
