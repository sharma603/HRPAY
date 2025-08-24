import express from "express";
import userRoutes from "./user.routes.js";
import systemSettingsRoutes from "./systemSettings.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import companyInfoRoutes from "./companyInfo.js";
import notificationRoutes from "./notifications.js";
import employeeRoutes from "./employee.routes.js";
import tasRoutes from "./tas.routes.js";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

// Convenience auth endpoints to support clients that call /api/login and /api/register directly
// These forward to the same controllers used by /api/users/*
router.post("/login", userController.loginUser);
router.post("/register", userController.createUser);

router.use("/users", userRoutes);
router.use("/system-settings", systemSettingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/company-info", companyInfoRoutes);
router.use("/notifications", notificationRoutes);
router.use("/employees", employeeRoutes);
router.use("/tas", tasRoutes);

export default router;
