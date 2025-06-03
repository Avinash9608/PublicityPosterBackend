const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", TemplateSchema);
