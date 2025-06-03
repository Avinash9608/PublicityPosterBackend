// models/Poster.js
const mongoose = require("mongoose");

const PosterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  finalPosterUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Poster", PosterSchema);
