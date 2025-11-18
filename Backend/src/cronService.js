// 📁 src/services/cronService.js

const cron = require('node-cron');
const eventModel = require('./models/eventModel');
const NotificationModel = require('./models/notificationModel');
const UserModel = require('./models/UserModel'); 
const REMINDER_MINUTES = 30;

// Función que ejecuta la lógica de recordatorio
const checkAndSendReminders = async () => {
    console.log(`[CRON] Buscando eventos próximos a iniciar en ~${REMINDER_MINUTES} minutos...`);
    
    try {
        const eventosProximos = await eventModel.getEventsForReminder();

        if (eventosProximos.length === 0) {
            console.log('[CRON] No se encontraron eventos para recordar.');
            return;
        }

        console.log(`[CRON] Encontrados ${eventosProximos.length} eventos para recordatorio. Iniciando notificaciones.`);

        for (const evento of eventosProximos) {
            const { id, titulo, participantes,idOrganizador } = evento;
            
            // Usamos el ID interno del organizador para obtener el nombre (puedes omitir esto si no lo necesitas)
            const organizador = await UserModel.getUserById(evento.idOrganizador);
            const organizadorNombre = organizador ? organizador.nombre : 'El organizador';

            const notifTipo = "EVENTO_RECORDATORIO";
            for (const participante of participantes) {
                const usuarioId = participante.id; // ID interno del participante
                
                let notifContenido;

                // 🚨 LÓGICA DE FILTRADO DE MENSAJE
                if (usuarioId === idOrganizador) {
                    // Mensaje para el propio organizador (ej: Karen)
                    notifContenido = `¡Tu evento "${titulo}" comenzará en 30 minutos!`;
                    console.log(`[CRON] - Mensaje personalizado para Organizador ID ${usuarioId}.`);
                } else {
                    // Mensaje para los demás participantes
                    notifContenido = `¡El evento "${titulo}" organizado por ${organizadorNombre} comenzará en 30 minutos! Prepárate.`;
                }
                
                try {
                    await NotificationModel.createNotification(
                        usuarioId, 
                        notifTipo, 
                        notifContenido, 
                        id // ID del evento
                    );
                } catch (error) {
                    console.error(`❌ Falló la notificación de recordatorio para el usuario ID ${usuarioId} del evento ${id}: ${error.message}`);
                }
            }

            // 2. Marcar el evento como notificado para no enviar otra vez
            await eventModel.markReminderSent(id);
            console.log(`[CRON] ✅ Recordatorio enviado y evento ${id} marcado como notificado.`);
        }

    } catch (error) {
        console.error('❌ Error CRON al procesar recordatorios:', error);
    }
};

// Programa la tarea para que se ejecute cada 5 minutos
const startReminderJob = () => {
    // La expresión cron '*/5 * * * *' significa: cada 5 minutos, cada hora, cada día, cada mes, cualquier día de la semana.
    cron.schedule('*/5 * * * *', async () => {
        await checkAndSendReminders();   // ✅ recordatorios
        await checkEventStates();        // ✅ actualización de estados
    }, {
        scheduled: true,
        timezone: "America/Bogota" // 🚨 Ajusta la zona horaria a la de tu servidor/aplicación
    });

    console.log('[CRON] Tarea de recordatorios de eventos iniciada: se ejecuta cada minuto.');
};

// 📁 src/services/cronService.js (Solo la lógica interna de los loops ha cambiado)

const checkEventStates = async () => {
    // ... (Definición de ahoraUTC, BOGOTA_OFFSET_HOURS, y ahoraBogota se mantiene igual)
    const ahoraUTC = new Date();
    const BOGOTA_OFFSET_HOURS = 5; // UTC-5
    const ahoraBogota = new Date(ahoraUTC.getTime() - (BOGOTA_OFFSET_HOURS * 60 * 60 * 1000));
    // ... (console.log de TZ CHECK se mantiene)

    try {
        // ------------------------------
        // 1) Eventos que deben pasar de 10 -> 16 (INICIO)
        // ------------------------------
        const eventosPorEmpezar = await eventModel.getEventosByEstado(10);

        for (const evento of eventosPorEmpezar) {
            // ... (variables y validaciones se mantienen) ...
            const horaBD = evento.Hora;        
            const fechaBD = evento.Fecha;     

            if (!horaBD || !fechaBD) { /* ... */ continue; }
            
            // 1. Extraer el día (YYYY-MM-DD)
            const fechaString = fechaBD.toISOString().split('T')[0];
            
            // 2. Obtener componentes de tiempo
            const [y, m, d] = fechaString.split('-').map(Number);
            const [h, min, s] = horaBD.split(':').map(Number);

            // 🔑 CORRECCIÓN CLAVE: Construir la hora del evento *solo* como UTC, 
            // usando la hora de la BD como si fuera UTC. 
            // La compensación de -5h ya está aplicada en 'ahoraBogota'.
            const horaEvento = new Date(Date.UTC(y, m - 1, d, h, min, s || 0));

            // NOTA: horaEvento.getTime() ya es la hora correcta de inicio en UTC.
            
            console.log(`[CRON DEBUG] Evento ${evento.Id}. Ahora Bogotá: ${ahoraBogota.toString()}. Hora Evento: ${horaEvento.toString()}.`);

            // Usar .getTime() para una comparación precisa en milisegundos
            if (ahoraBogota.getTime() >= horaEvento.getTime()) {
                await eventModel.updateEstado(evento.Id, 16);
                console.log(`[CRON] Evento ${evento.Id} inició → cambiado a 16.`);
            }
        }

        // ------------------------------
        // 2) Eventos que deben pasar de 16 -> 12 (FIN)
        // ------------------------------

        const eventosEnCurso = await eventModel.getEventosByEstado(16);
        for (const evento of eventosEnCurso) {
            const horaFinalBD = evento.Hora_final; 
            const fechaBD = evento.Fecha;

            if (!horaFinalBD || !fechaBD) { /* ... */ continue; }
            
            // 🔑 Aplicar la misma construcción simplificada
            const fechaString = fechaBD.toISOString().split('T')[0];
            const [y, m, d] = fechaString.split('-').map(Number);
            const [h, min, s] = horaFinalBD.split(':').map(Number);

            // Construir la hora final solo como UTC
            const horaFinal = new Date(Date.UTC(y, m - 1, d, h, min, s || 0));
            
            // 🔑 COMPARACIÓN FINAL
            if (ahoraBogota.getTime() >= horaFinal.getTime()) {
                await eventModel.updateEstado(evento.Id, 12);
                console.log(`[CRON] ✅ Evento ${evento.Id} actualizado de 16 a 12 (evento terminó).`);
            }
        }
    } catch (error) {
        console.error('❌ Error CRON al actualizar estados:', error);
    }
};

module.exports = { startReminderJob };