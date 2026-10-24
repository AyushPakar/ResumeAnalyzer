import {
  listHistory,
  retryResume,
  deleteResume,
} from "../services/history.service.js";

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    retryable: Boolean(error.retryable),
  });
}

const historyController = {
  // GET /api/history
  async list(req, res) {
    try {
      const resumes = await listHistory(req.user._id);
      res.status(200).json({ success: true, resumes });
    } catch (error) {
      console.error("History list failed:", error);
      sendError(res, error);
    }
  },

  // POST /api/history/:id/retry
  async retry(req, res) {
    try {
      const resume = await retryResume(req.params.id, req.user._id);
      res.status(200).json({ success: true, resume });
    } catch (error) {
      console.error("Retry failed:", error);
      sendError(res, error);
    }
  },

  // DELETE /api/history/:id
  async remove(req, res) {
    try {
      await deleteResume(req.params.id, req.user._id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Delete failed:", error);
      sendError(res, error);
    }
  },
};

export default historyController;
