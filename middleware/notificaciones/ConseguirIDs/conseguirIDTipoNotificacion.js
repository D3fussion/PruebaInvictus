import TipoNotificacion from "../../../models/notificaciones/TipoNotificacion.js";

const conseguirIDTipoNotificacion = async () => {

    const reactivoAgotado = await TipoNotificacion.findOne({ nombre: "Reactivo Agotado" });
    const equipoCalendarizado = await TipoNotificacion.findOne({ nombre: "Equipo Calendarizado" });
    const equipoMantenimiento = await TipoNotificacion.findOne({ nombre: "Equipo en Mantenimiento" });

    if (!reactivoAgotado || !equipoCalendarizado || !equipoMantenimiento) {
        throw new Error("Uno o más tipos de notificación no existen en la base de datos");
    }

    cachedTipoNotificacion = [
        reactivoAgotado._id,
        equipoCalendarizado._id,
        equipoMantenimiento._id
    ];
    return cachedTipoNotificacion;
};

export default conseguirIDTipoNotificacion;
