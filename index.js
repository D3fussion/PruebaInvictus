import express from 'express';
import dotenv from 'dotenv';
import conectarDB from '../config/db.js';

import reactivoRoutes from '../routes/reactivoRoutes.js';
import inicioRoutes from '../routes/inicioRoutes.js';
import notificacionRoutes from '../routes/notificacionRoutes.js';

import { createServer } from '@vercel/node';
import { parse } from 'url';

dotenv.config();
conectarDB();

const app = express();
app.use(express.json());

app.use("/api/reactivos", reactivoRoutes);
app.use("/api/inicio", inicioRoutes);
app.use("/api/notificaciones", notificacionRoutes);

export default app;