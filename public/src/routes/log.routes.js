import { Router } from "express";
import { authenticateToken, loginUser, registerUser } from "../controllers/log.controller.js";


const router = Router();

router.get('/verify-token', authenticateToken,  (req , res) =>  res.json({valid: true}));
router.post("/loginUser", loginUser);
router.post("/registro", registerUser);

export default router;