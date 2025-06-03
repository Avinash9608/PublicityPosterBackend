const express = require("express");
const router = express.Router();

const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTemplatePreview,
} = require("../controllers/templateController");

// GET all templates
router.get("/", getTemplates);

// POST new template
router.post("/", createTemplate);

// GET a specific template by ID
router.get("/:id", getTemplate);

// PUT update a template by ID
router.put("/:id", updateTemplate);

// DELETE a template by ID
router.delete("/:id", deleteTemplate);

// PUT update template preview by ID (correct route to avoid conflict)
router.put("/preview/:id", uploadTemplatePreview);

module.exports = router;
