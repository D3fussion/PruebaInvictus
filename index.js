// IMPORTACIONES
import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';

// RUTAS PARA LA API
import reactivoRoutes from './routes/reactivoRoutes.js';
import inicioRoutes from './routes/inicioRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';

dotenv.config();
conectarDB();

const app = express();
app.use(express.json());

app.use("/api/reactivos", reactivoRoutes);
app.use("/", inicioRoutes);
app.use("/api/notificaciones", notificacionRoutes);

export default app;