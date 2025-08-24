import express from "express";
import * as userController from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", userController.createUser); // Public registration endpoint
router.post("/login", userController.loginUser); // Public login endpoint

export default router; 