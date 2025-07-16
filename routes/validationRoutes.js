import express from "express";
import { getData } from "../controllers/validationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { canAccessUser } from "../middleware/attributeBaseAccessControl.js";
import { rateLimitter } from "../middleware/rateLimmiter.js";

const router = express.Router();


router.get("/auth/:id",rateLimitter({
    limit: 2, // Maximum number of requests allowed
    timer: 60, // Time window in seconds
    key: 'validateionGetRoute' // Unique key for this route
}),getData)
// router.get("/auth/:id",isAuthenticated,authorizeRoles("admin"),canAccessUser,getData)
// router.get("/auth",isAuthenticated,authorizeRoles("customer"),getData)
// router.get("/auth",isAuthenticated,authorizeRoles("teacher"),getData)

export default router;