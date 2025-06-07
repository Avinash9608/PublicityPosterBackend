// // src/utils/fileUpload.js
// const multer = require("multer");
// const path = require("path");
// const crypto = require("crypto");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(
//       __dirname,
//       "..",
//       "..",
//       "src",
//       "uploads",
//       "kyc"
//     );
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Generate a random string for filename if user ID isn't available
//     const randomString = crypto.randomBytes(8).toString("hex");
//     cb(
//       null,
//       `kyc-${randomString}-${Date.now()}${path.extname(file.originalname)}`
//     );
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|pdf/;
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Only images (JPEG, JPG, PNG) and PDFs are allowed"));
//     }
//   },
// });

// module.exports = upload;
// src/utils/fileUpload.js
require("dotenv").config();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: "kyc_uploads",
//     public_id: `kyc-${Date.now()}`,
//     allowed_formats: ["jpg", "jpeg", "png", "pdf"],
//   }),
// });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kyc_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});
const upload = multer({ storage });

module.exports = upload;
