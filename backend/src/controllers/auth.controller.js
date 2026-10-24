import { registerUser, loginUser, toPublicUser } from "../services/auth.service.js";

// Known problems (wrong password, duplicate email...) carry a statusCode and a
// message that is safe to show. Anything else is logged and hidden behind a
// generic message, so internal details never reach the browser.
function sendError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  console.error("Auth error:", error);
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
}

const authController = {
  // POST /api/auth/register   body: { name, email, password }
  async register(req, res) {
    try {
      const { user, token } = await registerUser(req.body ?? {});
      res.status(201).json({ success: true, token, user });
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /api/auth/login   body: { email, password }
  async login(req, res) {
    try {
      const { user, token } = await loginUser(req.body ?? {});
      res.status(200).json({ success: true, token, user });
    } catch (error) {
      sendError(res, error);
    }
  },

  // GET /api/auth/me   (requireAuth has already put the user on req.user)
  me(req, res) {
    res.status(200).json({ success: true, user: toPublicUser(req.user) });
  },
};

export default authController;
