import express from 'express';
import { deleteUser, getAllUsers, loginUser, refreshAccessToken, registerNewUser, requestPasswordReset, resetPassword, updateUser } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { rateLimitter } from '../middleware/rateLimmiter.js';

const router = express.Router();


router.post('/new',upload.single("image"),registerNewUser)
router.post('/login', loginUser)
router.put("/request-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshAccessToken)


router.get("/all",getAllUsers);
// router.get("/all",isAuthenticated,authorizeRoles("user"), getAllUsers);

// DELETE user
router.delete('/:id', deleteUser);

// PUT user
router.put('/:id', updateUser);

// router.post("/logout", logoutUser);

export default router;
