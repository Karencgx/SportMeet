//friendRoutes
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

// ✅ Obtener una amistad específica por ID (más específico)
router.get('/detalle/:id', friendController.getAmigoById);

// ✅ Obtener todas las amistades de un usuario (por su ID)
router.get('/:userId', friendController.getAllAmigos);

// ✅ Crear una nueva solicitud de amistad
router.post('/', friendController.createAmigo);

// ✅ Actualizar el estado de una amistad (aceptar / rechazar)
router.put('/:id', friendController.updateAmigo);

// ✅ Eliminar una amistad
router.delete('/:id', friendController.deleteAmigo);

module.exports = router;