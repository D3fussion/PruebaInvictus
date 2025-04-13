import express from 'express';
const router = express.Router();
import { devolverDatosInicio } from '../controllers/inicioController.js';
import { prueba } from "../controllers/prueba.js"

router.get('/', devolverDatosInicio);
router.get("/prueba", prueba);

export default router;