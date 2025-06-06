const express = require("express");
const router = express.Router();
const templateController = require("../controllers/template.controller");

router.get("/", templateController.getAllTemplates);
router.post("/", templateController.createTemplate);
router.put("/:id", templateController.updateTemplate);
router.delete("/:id", templateController.deleteTemplate);

module.exports = router;
