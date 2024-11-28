import { Router } from "express";
import { authenticateToken} from "../controllers/log.controller.js";
import { insertarTareas } from "../controllers/tareas.controller.js";

const router = Router();

router.post("/postTareas", authenticateToken, insertarTareas);

export default router;