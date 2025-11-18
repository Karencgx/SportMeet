const installationModel = require("../models/installationModel");

// GET /instalaciones
const getInstallations = async (req, res) => {
  try {
    const installations = await installationModel.getAllInstallations();
    res.status(200).json(installations);
  } catch (error) {
    console.error("Error al obtener instalaciones:", error);
    res.status(500).json({ error: "Error al obtener instalaciones" });
  }
};


// GET /instalaciones/:id
const getInstallationById = async (req, res) => {
  try {
    const { id } = req.params;
    const installation = await installationModel.getInstallationById(id);
    if (!installation) {
      return res.status(404).json({ error: "Instalación no encontrada" });
    }
    res.json(installation);
  } catch (error) {
    console.error("Error al obtener instalación:", error);
    res.status(500).json({ error: "Error al obtener instalación" });
  }
};

const getInstallationsBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const installations = await installationModel.getInstallationsBySport(sportId);
    res.status(200).json(installations);
  } catch (error) {
    console.error("Error al obtener instalaciones por deporte:", error);
    res.status(500).json({ error: "Error al obtener instalaciones por deporte" });
  }
};

// POST /instalaciones
const createInstallation = async (req, res) => {
  try {
    const newInstallation = await installationModel.createInstallation(req.body);
    res.status(201).json(newInstallation);
  } catch (error) {
    console.error("Error al crear instalación:", error);
    res.status(500).json({ error: "Error al crear instalación" });
  }
};

// PUT /instalaciones/:id
const updateInstallation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await installationModel.updateInstallation(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar instalación:", error);
    res.status(500).json({ error: "Error al actualizar instalación" });
  }
};

// DELETE /instalaciones/:id
const deleteInstallation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await installationModel.deleteInstallation(id);
    res.json(result);
  } catch (error) {
    console.error("Error al eliminar instalación:", error);
    res.status(500).json({ error: "Error al eliminar instalación" });
  }
};

module.exports = {
  getInstallations,
  getInstallationById,
  getInstallationsBySport,
  createInstallation,
  updateInstallation,
  deleteInstallation,
};
