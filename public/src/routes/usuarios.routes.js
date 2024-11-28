import { Router } from "express";
import { authenticateToken} from "../controllers/log.controller.js";
import {ObtenerTareas, obtenerUsuariosOrg, ActualizarProgresoTareas} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/obtenerTareas", authenticateToken, ObtenerTareas);
router.get("/obtenerUsuariosOrg", authenticateToken, obtenerUsuariosOrg);


export default router;