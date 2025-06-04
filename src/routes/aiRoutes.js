const express = require("express");
const router = express.Router();
const { generateTemplateFromPrompt } = require("../controllers/aiController");
const { protect, admin } = require("../middlewares/auth");

router.post("/generate-template", protect, generateTemplateFromPrompt);

module.exports = router;
