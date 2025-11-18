// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, requireAdmin } = require('../auth');

// POST /usuarios -> crear usuario
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);


router.use(verifyToken);

router.get("/perfil", userController.getProfile);

// GET/usuarios -> lista de usuarios
router.get('/', userController.getUsers);

// GET /usuarios/:id → perfil de usuario
router.get("/:id", userController.getUserById);

router.put("/:id", userController.updateUser);  // Actualizar

router.patch('/:id/status', requireAdmin, userController.toggleUserStatusController);

module.exports = router;

