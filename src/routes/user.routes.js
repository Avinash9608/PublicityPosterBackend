// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const upload = require("../utils/fileUpload");
const User = require("../models/User");

router.post("/kyc", protect, upload.array("documents", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const fileUrls = req.files.map((file) => `/uploads/kyc/${file.filename}`);
    await User.findByIdAndUpdate(req.user.id, {
      kycDocs: fileUrls,
      kycStatus: "pending",
    });

    res.status(200).json({
      success: true,
      message: "KYC documents uploaded successfully",
      documents: fileUrls,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "KYC upload failed",
      error: err.message,
    });
  }
});

module.exports = router;
