import {
  readProfile,
  saveProfile,
  removeAccount,
} from "../services/settings.service.js";

// Known problems carry a statusCode and a safe message. Anything else is
// logged and hidden behind a generic message.
function sendError(res, error) {
  if (error.statusCode) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }
  console.error("Settings error:", error);
  res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
}

const settingsController = {
  // GET /api/settings/profile
  async getProfile(req, res) {
    try {
      const profile = await readProfile(req.user._id);
      res.status(200).json({ success: true, profile });
    } catch (error) {
      sendError(res, error);
    }
  },

  // PATCH /api/settings/profile   body: { name, email, targetRole, experienceLevel }
  async updateProfile(req, res) {
    try {
      const profile = await saveProfile(req.user._id, req.body ?? {});
      res.status(200).json({ success: true, profile });
    } catch (error) {
      sendError(res, error);
    }
  },

  // DELETE /api/settings/account   body: { password }
  async deleteAccount(req, res) {
    try {
      await removeAccount(req.user._id, req.body?.password);
      res.status(200).json({ success: true });
    } catch (error) {
      sendError(res, error);
    }
  },

  // POST /api/settings/logout
  async logout(req, res) {
    try {
      // If authentication uses an HTTP-only cookie:
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      sendError(res, error);
    }
  },
};

export default settingsController;
