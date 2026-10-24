import express from "express";
import historyController from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", historyController.list);
router.post("/:id/retry", historyController.retry);
router.delete("/:id", historyController.remove);

export default router;
