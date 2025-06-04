const express = require("express");
const router = express.Router();
const { generateTemplateFromPrompt } = require("../controllers/aiController");

// No authentication required
router.post("/generate-template", generateTemplateFromPrompt);

module.exports = router;
