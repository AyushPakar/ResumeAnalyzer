// import mongoose from "mongoose";

// const resumeSchema = new mongoose.Schema(
//   {
//     fileId: { type: mongoose.Schema.ObjectId, required: true },
//     originalName: { type: String, required: true },
//     mimeType: String,
//     size: Number,

//     fileHash: { type: String, required: true, index: true },

//     status: {
//       type: String,
//       enums: ["Processing", "Completed", "Failed"],
//       default: "Processing",
//     },

//     analysis: { type: mongoose.Schema.Types.Mixed, default: null },
//     error: { type: String, default: null },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("Resume", resumeSchema);

import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    originalName: { type: String, required: true },
    mimeType: String,
    size: Number,

    fileHash: { type: String, required: true, index: true },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },

    analysis: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Resume", resumeSchema);
