const Template = require("../models/Template");
const cloudinary = require("../utils/cloudinary"); // Remove .v2 here

// exports.createTemplate = async (req, res) => {
//   try {
//     console.log("Cloudinary uploader exists:", !!cloudinary.uploader); // Debug line

//     const { title, category, imageBase64 } = req.body;

//     if (!title || !category || !imageBase64) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Debug the incoming image
//     console.log("Image base64 starts with:", imageBase64.substring(0, 50));

//     const uploadedResponse = await cloudinary.uploader.upload(imageBase64, {
//       folder: "templates",
//       resource_type: "auto",
//     });

//     const newTemplate = await Template.create({
//       title,
//       category,
//       imageUrl: uploadedResponse.secure_url,
//       cloudinaryId: uploadedResponse.public_id,
//     });

//     res.status(201).json(newTemplate);
//   } catch (err) {
//     console.error("Full error creating template:", err);
//     res.status(500).json({
//       error: err.message || "Internal server error",
//       stack: err.stack, // Only for development!
//     });
//   }
// };
exports.createTemplate = async (req, res) => {
  try {
    const { title, category, imageUrl } = req.body;

    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if image is base64 (manual upload) or URL (AI generated)
    let uploadedResponse;
    if (imageUrl.startsWith("data:image")) {
      // Handle base64 upload
      uploadedResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "templates",
        resource_type: "auto",
      });
    } else {
      // Handle direct URL (from AI generation)
      uploadedResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "templates",
      });
    }

    const newTemplate = await Template.create({
      title,
      category,
      imageUrl: uploadedResponse.secure_url,
      cloudinaryId: uploadedResponse.public_id,
    });

    res.status(201).json(newTemplate);
  } catch (err) {
    console.error("Error creating template:", err);
    res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
};
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, imageBase64 } = req.body;

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ error: "Template not found" });

    if (imageBase64) {
      await cloudinary.uploader.destroy(template.cloudinaryId);
      const uploadedResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: "templates",
      });
      template.imageUrl = uploadedResponse.secure_url;
      template.cloudinaryId = uploadedResponse.public_id;
    }

    template.title = title || template.title;
    template.category = category || template.category;

    await template.save();
    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// backend/src/controllers/template.controller.js
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the template first to get Cloudinary ID
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // 2. Delete from Cloudinary if exists
    if (template.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(template.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    // 3. Delete from database - using deleteOne() instead of remove()
    await Template.deleteOne({ _id: id });

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: "Failed to delete template",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
