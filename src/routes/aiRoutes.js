const express = require("express");
const router = express.Router();
const { generateTemplateFromPrompt } = require("../controllers/aiController");

// Simple health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// AI generation endpoint
router.post("/generate-template", generateTemplateFromPrompt);

module.exports = router;
