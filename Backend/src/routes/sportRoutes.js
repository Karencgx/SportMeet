const express = require("express");
const router = express.Router();
const sportController = require("../controllers/sportController");

router.get("/", sportController.getDeportes);
router.get("/:id", sportController.getDeporte);
router.post("/", sportController.createDeporte);
router.put("/:id", sportController.updateDeporte);
router.delete("/:id", sportController.deleteDeporte);

module.exports = router;
