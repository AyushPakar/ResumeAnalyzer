import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const SALT_ROUNDS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Used when the email isn't found, so "no such account" takes about as long as
// "wrong password" and the response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file and restart the server.");
  }
  return process.env.JWT_SECRET;
}

const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

// What the frontend is allowed to see about a user
export function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

/* ------------------------------------------------------------------
   Tokens
------------------------------------------------------------------- */

export function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Throws if the token is invalid, tampered with, or expired
export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

/* ------------------------------------------------------------------
   Sign up / log in
------------------------------------------------------------------- */

export async function registerUser({ name, email, password }) {
  const cleanName = String(name ?? "").trim();
  const cleanEmail = normalizeEmail(email);
  const pwd = String(password ?? "");

  if (cleanName.length < 2 || cleanName.length > 60) {
    throw httpError(400, "Enter your full name (2 to 60 characters).");
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (pwd.length < 8) {
    throw httpError(400, "Password must be at least 8 characters.");
  }
  // bcrypt only looks at the first 72 bytes, so reject anything longer
  if (Buffer.byteLength(pwd) > 72) {
    throw httpError(400, "Password is too long (maximum 72 characters).");
  }

  if (await User.exists({ email: cleanEmail })) {
    throw httpError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(pwd, SALT_ROUNDS);

  try {
    const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash });
    return { user: toPublicUser(user), token: signToken(user) };
  } catch (err) {
    // Two sign-ups with the same email at the same moment: the unique index catches it
    if (err.code === 11000) {
      throw httpError(409, "An account with this email already exists.");
    }
    throw err;
  }
}

export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const pwd = String(password ?? "");

  if (!cleanEmail || !pwd) {
    throw httpError(400, "Enter your email and password.");
  }

  const user = await User.findOne({ email: cleanEmail }).select("+passwordHash");
  const passwordMatches = await bcrypt.compare(pwd, user?.passwordHash ?? DUMMY_HASH);

  // Same message for "no such email" and "wrong password"
  if (!user || !passwordMatches) {
    throw httpError(401, "Invalid email or password.");
  }

  return { user: toPublicUser(user), token: signToken(user) };
}

export function getUserById(id) {
  return User.findById(id);
}
