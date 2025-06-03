const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const Poster = require("../models/Poster");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

// Save poster and send WhatsApp message
router.post("/", protect, async (req, res) => {
  try {
    const { templateId, businessName, phoneNumber, logoUrl, finalPosterUrl } =
      req.body;

    const poster = new Poster({
      user: req.user.id,
      template: templateId,
      businessName,
      phoneNumber,
      logoUrl,
      finalPosterUrl,
    });

    await poster.save();

    // ✅ Use your utility to send the WhatsApp message
    // Send WhatsApp message
    try {
      if (req.user.mobileNumber) {
        // Changed from phoneNumber to mobileNumber
        await sendWhatsAppMessage(
          req.user.mobileNumber, // Using mobileNumber from user object
          `Your poster "${businessName}" has been successfully created! `
        );
        console.log("WhatsApp message sent to:", req.user.mobileNumber);
      } else {
        console.log(
          "No mobile number found for user, skipping WhatsApp message"
        );
      }
    } catch (twilioError) {
      console.error("Twilio error:", twilioError);
    }

    res.json(poster);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get user's posters
router.get("/my-posters", protect, async (req, res) => {
  try {
    const posters = await Poster.find({ user: req.user.id })
      .populate("template", "title imageUrl")
      .sort({ createdAt: -1 });

    res.json(posters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
