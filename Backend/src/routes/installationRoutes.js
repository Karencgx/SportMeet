const express = require("express");
const router = express.Router();
const installationController = require("../controllers/installationController");

router.get("/", installationController.getInstallations);
router.get("/deporte/:sportId", installationController.getInstallationsBySport);
router.get("/:id", installationController.getInstallationById);
router.post("/", installationController.createInstallation);
router.put("/:id", installationController.updateInstallation);
router.delete("/:id", installationController.deleteInstallation);

module.exports = router;
