import conectarDB from '../config/db.js';
import Reserva from '../models/equipo/Reserva.js';
import Equipo from "../models/equipo/Equipo.js"

const seedReserva = async () => {
    try {
        await conectarDB(); // Conectar a la base de datos
        await Reserva.deleteMany(); // Limpiar la colección
        const equipos = await Equipo.find();

        const getIdByName = (array, nombre) => {
            const obj = array.find(item => item.nombre === nombre);
            return obj ? obj._id : null;
        };

        const reservas = [
            {
                equipo: "Microscopio Digital",
                persona: "Diego",
                fechaInicio: new Date('2025-02-01'),
                fechaFin: new Date('2025-02-02'),
                status: true
            },
        ];

        for (const item of reservas) {
            const nuevaReserva = new Reserva({
		        idEquipo: getIdByName(equipos, item.equipo),
                persona: item.persona,
                fechaInicio: item.fechaInicio,
                fechaFin: item.fechaFin,
                status: item.status
            });

            await nuevaReserva.save();
            console.log(`Reserva "${item.nombre}" guardado.`);
        }

        console.log('Reservas sembradas exitosamente');
    } catch (error) {
        console.error('Error al sembrar la base de datos:', error.message);
        throw error;
    }
}

export default seedReserva;