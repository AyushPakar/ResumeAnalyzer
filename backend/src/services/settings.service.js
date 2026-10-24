import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPERIENCE_LEVELS = ["", "fresher", "1-3", "3-5", "5+"];

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// What the Settings page is allowed to see
function toProfile(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    targetRole: user.targetRole || "",
    experienceLevel: user.experienceLevel || "",
  };
}

export async function readProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw httpError(404, "Account not found.");
  return toProfile(user);
}

export async function saveProfile(userId, input = {}) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const targetRole = String(input.targetRole ?? "").trim();
  const experienceLevel = String(input.experienceLevel ?? "");

  if (name.length < 2 || name.length > 60) {
    throw httpError(400, "Enter your full name (2 to 60 characters).");
  }
  if (!EMAIL_RE.test(email)) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (targetRole.length > 80) {
    throw httpError(400, "Target role is too long (maximum 80 characters).");
  }
  if (!EXPERIENCE_LEVELS.includes(experienceLevel)) {
    throw httpError(400, "Choose one of the listed experience levels.");
  }

  // Email must stay unique across accounts (ignoring this user's own)
  if (await User.exists({ email, _id: { $ne: userId } })) {
    throw httpError(409, "Another account already uses this email.");
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, targetRole, experienceLevel },
      { new: true, runValidators: true },
    );
    if (!user) throw httpError(404, "Account not found.");
    return toProfile(user);
  } catch (err) {
    if (err.code === 11000) {
      throw httpError(409, "Another account already uses this email.");
    }
    throw err;
  }
}

// Permanently deletes the account. The password is required, so someone
// at an unlocked, logged-in computer can't delete it with one click.
export async function removeAccount(userId, password) {
  const pwd = String(password ?? "");
  if (!pwd) throw httpError(400, "Enter your password to confirm.");

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw httpError(404, "Account not found.");

  const matches = await bcrypt.compare(pwd, user.passwordHash);
  // 403 on purpose, not 401: the frontend treats a 401 as "session expired"
  // and logs the user out, which isn't what a mistyped password should do.
  if (!matches) throw httpError(403, "Incorrect password.");

  // When resumes belong to users, this is where that user's resumes, stored
  // files and job matches get deleted too.
  await user.deleteOne();
}
