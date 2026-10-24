import { verifyToken, getUserById } from "../services/auth.service.js";

// Put this in front of any route that needs a logged-in user.
// On success it sets req.user, so controllers know who is calling.
export async function requireAuth(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "Please log in to continue." });
    }

    const payload = verifyToken(token);

    // Look the user up every time, so a deleted account's token stops working
    const user = await getUserById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "This account no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Your session has expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid session. Please log in again." });
    }

    console.error("Auth check failed:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}
