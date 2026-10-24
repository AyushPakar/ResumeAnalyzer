import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Stored lowercase and unique, so "A@x.com" and "a@x.com" are the same account
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Only the bcrypt hash is stored, never the password itself.
    // select:false keeps it out of query results unless a query asks for it.
    passwordHash: { type: String, required: true, select: false },

    // Profile fields edited on the Settings page
    targetRole: { type: String, trim: true, default: "" },
    experienceLevel: { type: String, default: "" }, // "", "fresher", "1-3", "3-5", "5+"
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
