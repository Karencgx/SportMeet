const stateModel = require("../models/stateModel");

const getEstados = async (req, res) => {
  try {
    const estados = await stateModel.getAllEstados();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estados" });
  }
};

const getEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const estado = await stateModel.getEstadoById(id);
    if (!estado) return res.status(404).json({ error: "Estado no encontrado" });
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado" });
  }
};

const createEstado = async (req, res) => {
  try {
    const newEstado = await stateModel.createEstado(req.body);
    res.status(201).json(newEstado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear estado" });
  }
};


const deleteEstado = async (req, res) => {
  try {
    const { id } = req.params;
    await stateModel.deleteEstado(id);
    res.json({ message: "Estado eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar estado" });
  }
};

module.exports = { getEstados, getEstado, createEstado, deleteEstado };
