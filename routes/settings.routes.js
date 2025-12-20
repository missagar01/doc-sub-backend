import { Router } from "express";
import { getAllUsers, updateUserAccess, getUserAccess } from "../controllers/settingsController.js";

const router = Router();

// Get all users with access settings
router.get("/users", getAllUsers);

// Get single user access settings
router.get("/users/:id", getUserAccess);

// Update user access settings
router.put("/users/:id/access", updateUserAccess);

export default router;
