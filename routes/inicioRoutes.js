import express from 'express';
import { devolverDatosInicio } from '../controllers/inicioController.js';
import { prueba } from "../controllers/prueba.js"

const router = express.Router();

router.get('/', devolverDatosInicio);
router.get("/prueba", prueba);

export default router;