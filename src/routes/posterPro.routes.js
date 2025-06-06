const express = require("express");
const router = express.Router();
const PosterPro = require("../models/PosterPro");
const cloudinary = require("../utils/cloudinary");

router.post("/", async (req, res) => {
  try {
    const { imageData, templateId, title, description, design } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: "Image data is required",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: "poster_pro",
      resource_type: "image",
      quality: "auto:best",
    });

    const poster = new PosterPro({
      templateId,
      title: title || "Untitled Poster",
      description,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      design: {
        titleStyle: design?.titleStyle || {},
        descriptionStyle: design?.descriptionStyle || {},
        footer: design?.footer || {},
        textPosition: design?.textPosition || {},
        background: design?.background || {},
      },
    });

    await poster.save();

    res.status(201).json({
      success: true,
      poster,
    });
  } catch (error) {
    console.error("Error creating poster:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create poster",
      details: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const posters = await PosterPro.find().sort({ createdAt: -1 });
    res.json({ success: true, posters });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch posters",
    });
  }
});

module.exports = router;
