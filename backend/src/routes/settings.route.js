import express from "express";
import settingsController from "../controllers/settings.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Every Settings route needs a logged-in user
router.use(requireAuth);

router.get("/profile", settingsController.getProfile);
router.patch("/profile", settingsController.updateProfile);
router.delete("/account", settingsController.deleteAccount);
router.post("/logout", settingsController.logout);

export default router;
