const roleModel = require("../models/roleModel");

// GET /roles
const getRoles = async (req, res) => {
  try {
    const roles = await roleModel.getAllRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

// GET /roles/:id
const getRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleModel.getRoleById(id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rol" });
  }
};

// POST /roles
const createRole = async (req, res) => {
  try {
    const newRole = await roleModel.createRole(req.body);
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: "Error al crear rol" });
  }
};


module.exports = { getRoles, getRole, createRole };
