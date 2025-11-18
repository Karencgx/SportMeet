const sportModel = require("../models/sportModel"); 

// GET /deportes
const getDeportes = async (req, res) => {
  try {
    const deportes = await sportModel.getAllDeportes();
    res.json(deportes);
  } catch (error) {
    console.error("❌ Error al obtener deportes:", error.message);
    res.status(500).json({ error: "Error al obtener deportes" });
  }
};

// GET /deportes/:id
const getDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    const deporte = await sportModel.getDeporteById(id);
    if (!deporte) return res.status(404).json({ error: "Deporte no encontrado" });
    res.json(deporte);
  } catch (error) {
    console.error("❌ Error al obtener deporte y id:", error.message,id);
    res.status(500).json({ error: "Error al obtener deporte" });
  }
};

// POST /deportes
const createDeporte = async (req, res) => {
  try {
    const newDeporte = await sportModel.createDeporte(req.body);
    res.status(201).json(newDeporte);
  } catch (error) {
    console.error("❌ Error al crear deporte:", error.message);
    res.status(500).json({ error: "Error al crear deporte" });
  }
};

// PUT /deportes/:id
const updateDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await sportModel.updateDeporte(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error al actualizar deporte:", error.message);
    res.status(500).json({ error: "Error al actualizar deporte" });
  }
};

// DELETE /deportes/:id
const deleteDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    await sportModel.deleteDeporte(id);
    res.json({ message: "Deporte eliminado" });
  } catch (error) {
    console.error("❌ Error al eliminar deporte:", error.message);
    res.status(500).json({ error: "Error al eliminar deporte" });
  }
};

module.exports = {
  getDeportes,
  getDeporte,
  createDeporte,
  updateDeporte,
  deleteDeporte,
};
