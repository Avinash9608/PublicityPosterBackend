const mongoose = require("mongoose");

const PosterProSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
  },
  title: {
    type: String,
    default: "Untitled Poster",
  },
  description: String,
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  design: {
    titleStyle: {
      color: String,
      fontFamily: String,
      fontSize: String,
      textTransform: String,
    },
    descriptionStyle: {
      color: String,
      fontFamily: String,
      fontSize: String,
      textTransform: String,
    },
    footer: {
      leftText: String,
      rightText: String,
      color: String,
      fontSize: String,
    },
    textPosition: {
      left: String,
      top: String,
      transform: String,
      textAlign: String,
      width: String,
    },
    background: {
      color: String,
      imageUrl: String,
      overlayColor: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PosterProSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("PosterPro", PosterProSchema);
