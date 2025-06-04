const express = require("express");
const router = express.Router();
const { generateTemplateFromPrompt } = require("../controllers/aiController");

// Removed auth middleware
router.post("/generate-template", generateTemplateFromPrompt);

module.exports = router;
