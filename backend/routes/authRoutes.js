// routes/companyRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import verifyFirebaseToken from '../middlewares/authMiddleware.js';
const router = express.Router();


router.post('/verifyPhone', authController.verifyPhone);
router.post('/login', authController.sendCred);
router.get('/verifyToken', verifyFirebaseToken, authController.verifyToken );
router.get("/logout", authController.logout);

export default router;