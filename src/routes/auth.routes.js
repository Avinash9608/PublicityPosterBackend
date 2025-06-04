const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const upload = require("../utils/fileUpload");
const fs = require("fs");
const { protect } = require("../middlewares/auth");
const { sendWhatsAppMessage } = require("../utils/whatsappService");
// @route   POST /api/auth/register

//new register
// @route POST /api/auth/register
router.post(
  "/register",
  upload.fields([
    { name: "documentFront", maxCount: 1 },
    { name: "documentBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        aadhaarNumber,
        dateOfBirth,
        gender,
        mobileNumber,
        documentType,
      } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: new RegExp(`^${username.trim()}$`, "i") },
          { email: new RegExp(`^${email.trim()}$`, "i") },
        ],
      });

      if (existingUser) {
        // Cleanup uploaded files
        Object.values(req.files || {})
          .flat()
          .forEach((file) => fs.unlinkSync(file.path));
        return res.status(400).json({
          success: false,
          message:
            existingUser.username === username
              ? "Username already taken"
              : "Email already registered",
        });
      }

      // File paths
      // const documentFront = req.files?.documentFront?.[0]?.filename
      //   ? `/uploads/kyc/${req.files.documentFront[0].filename}`
      //   : null;
      // const documentBack = req.files?.documentBack?.[0]?.filename
      //   ? `/uploads/kyc/${req.files.documentBack[0].filename}`
      //   : null;
      // const selfie = req.files?.selfie?.[0]?.filename
      //   ? `/uploads/kyc/${req.files.selfie[0].filename}`
      //   : null;
      // Extract Cloudinary URLs
      const documentFront = req.files?.documentFront?.[0]?.path || null;
      const documentBack = req.files?.documentBack?.[0]?.path || null;
      const selfie = req.files?.selfie?.[0]?.path || null;

      // Determine KYC status
      const kycStatus = documentFront && selfie ? "pending" : "not_submitted";

      // Create new user
      const user = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        kycStatus,
        aadhaarNumber,
        dateOfBirth,
        gender,
        mobileNumber,
        documentType,
        documentFront,
        documentBack,
        selfie,
      });

      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
        },
        message: "Registration successful",
      });
      if (user.mobileNumber) {
        try {
          await sendWhatsAppMessage(
            user.mobileNumber,
            `Hello ${user.username}, your KYC has been successfully submitted for verification. We'll notify you once it's processed.`
          );
        } catch (err) {
          console.error("Failed to send WhatsApp notification:", err);
        }
      }
    } catch (err) {
      console.error("Register Error:", err);
      Object.values(req.files || {})
        .flat()
        .forEach((file) => fs.unlinkSync(file.path));
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      });
    }
  }
);

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    // Find user by email (case insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check account status
    if (user.kycStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval",
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// routes/auth.routes.js
router.get("/verify", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      kycStatus: req.user.kycStatus,
    },
  });
});

// routes/auth.routes.js
router.post("/logout", (req, res) => {
  // In a real implementation, you might want to invalidate the token
  res.json({ success: true, message: "Logged out successfully" });
});
module.exports = router;
