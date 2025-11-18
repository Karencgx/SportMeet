const express = require("express");
const router = express.Router();
const stateController = require("../controllers/stateController");

router.get("/", stateController.getEstados);
router.get("/:id", stateController.getEstado);
router.post("/", stateController.createEstado);
router.delete("/:id", stateController.deleteEstado);

module.exports = router;
