// 📁 src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { verifyToken, requireAdmin } = require('../auth');

// Todas las rutas de notificación deben estar protegidas, solo el usuario autenticado puede acceder.
router.use(verifyToken); 

// Ruta para obtener el listado de notificaciones no leídas
// GET /api/notificaciones/no-leidas
router.get('/no-leidas', NotificationController.getUnreadNotifications);

// Ruta para marcar un grupo de notificaciones como leídas
// POST /api/notificaciones/marcar-leidas
router.post('/marcar-leidas', NotificationController.markNotificationsAsRead);

module.exports = router;