
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Rutas de eventos
// ✅ 1. Rutas específicas sin parámetros
router.get("/", eventController.getAllEvents);
router.post("/salir", eventController.leaveEvent);
router.get("/organizador/:uid", eventController.getEventsByOrganizadorUid);
router.post("/horas-disponibles", eventController.getAvailableHours);
router.post("/probabilidad", eventController.getProbabilidadEvento);
router.post("/:id/unirse", eventController.unirseEvento);

// ✅ 2. Rutas con parámetros (siempre abajo)
router.get("/participante/:id", eventController.getEventsByParticipantId);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.patch('/:id/cancelar', eventController.cancelEvent);
module.exports = router;
