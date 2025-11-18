// 📁 src/routes/calificacionRoutes.js
const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacionController');
const { verifyToken } = require('../auth');


router.use(verifyToken);

// 1. Obtener los compañeros a calificar para un evento. Requiere autenticación.
router.get(
    '/evento/:idEvento/participantes', 
    calificacionController.getParticipantesParaCalificar
);

// 2. Registrar una o varias calificaciones. Requiere autenticación.
router.post(
    '/enviar',
    calificacionController.crearCalificacion
);

// 3. Obtener el promedio de calificación de cualquier usuario (público o privado).
router.get(
    '/usuarios/:idUsuario/promedio', 
    calificacionController.getCalificacionPromedio
);

module.exports = router;