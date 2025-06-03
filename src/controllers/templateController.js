// const Template = require("../models/Template");
// const asyncHandler = require("../middlewares/async");
// const ErrorResponse = require("../utils/errorResponse");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");

// // Configure storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = path.join(__dirname, "../../public/uploads");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed!"), false);
//     }
//   },
// });

// exports.createTemplate = asyncHandler(async (req, res, next) => {
//   try {
//     const { name, description } = req.body;

//     if (!name || !description) {
//       return next(new ErrorResponse("Name and description are required", 400));
//     }

//     if (!req.file) {
//       return next(new ErrorResponse("Please upload a preview image", 400));
//     }

//     // Create thumbnail
//     const thumbnailPath = path.join(
//       __dirname,
//       "../../public/uploads/thumbnails",
//       req.file.filename
//     );
//     await sharp(req.file.path).resize(200, 200).toFile(thumbnailPath);

//     const template = await Template.create({
//       name,
//       description,
//       imagePath: `/uploads/${req.file.filename}`,
//       thumbnailPath: `/uploads/thumbnails/${req.file.filename}`,
//       originalName: req.file.originalname,
//     });

//     res.status(201).json({
//       success: true,
//       data: {
//         _id: template._id,
//         name: template.name,
//         description: template.description,
//         imageUrl: template.imagePath,
//         thumbnailUrl: template.thumbnailPath,
//         createdAt: template.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating template:", error);
//     next(new ErrorResponse("Server error", 500));
//   }
// });
// // @access  Public
// exports.getTemplates = asyncHandler(async (req, res, next) => {
//   try {
//     const templates = await Template.find().select("-previewImage.data");

//     if (!templates || !Array.isArray(templates)) {
//       return next(new ErrorResponse("No templates found", 404));
//     }

//     // Format response consistently
//     const formattedTemplates = templates.map((template) => ({
//       _id: template._id,
//       name: template.name,
//       description: template.description,
//       previewUrl: `/api/v1/templates/${template._id}/preview`,
//       createdAt: template.createdAt,
//     }));

//     res.status(200).json({
//       success: true,
//       count: formattedTemplates.length,
//       data: formattedTemplates,
//     });
//   } catch (error) {
//     console.error("Error fetching templates:", error);
//     next(new ErrorResponse("Server error", 500));
//   }
// });

// // @desc    Get single template (without image binary)
// // @route   GET /api/v1/templates/:id
// // @access  Public
// exports.getTemplate = asyncHandler(async (req, res, next) => {
//   const template = await Template.findById(req.params.id).select(
//     "-previewImage"
//   );

//   if (!template) {
//     return next(
//       new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
//     );
//   }

//   // Add previewUrl for frontend
//   const templateObj = template.toObject();
//   templateObj.previewUrl = `/api/v1/templates/${template._id}/preview`;
//   templateObj.id = template._id;
//   templateObj.dateCreated = template.createdAt
//     ? template.createdAt.toISOString().split("T")[0]
//     : "";

//   res.status(200).json({
//     success: true,
//     data: templateObj,
//   });
// });

// // @desc    Create new template with image
// // @route   POST /api/v1/templates
// // @access  Private/Admin

// // @desc    Get template preview image (binary)
// // @route   GET /api/v1/templates/:id/preview
// // @access  Public
// exports.getTemplatePreview = asyncHandler(async (req, res, next) => {
//   const template = await Template.findById(req.params.id).select(
//     "previewImage"
//   );

//   if (!template?.previewImage?.data) {
//     return res.status(404).send("Image not found");
//   }

//   res.set({
//     "Content-Type": template.previewImage.contentType,
//     "Cache-Control": "public, max-age=86400",
//   });
//   res.send(template.previewImage.data);
// });

// // @desc    Update template (not image)
// // @route   PUT /api/v1/templates/:id
// // @access  Private/Admin
// exports.updateTemplate = asyncHandler(async (req, res, next) => {
//   let template = await Template.findById(req.params.id);

//   if (!template) {
//     return next(
//       new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
//     );
//   }

//   // Update regular fields
//   template.name = req.body.name || template.name;
//   template.description = req.body.description || template.description;
//   template.config = req.body.config || template.config;

//   await template.save();

//   // Prepare response object
//   const templateObj = template.toObject();
//   templateObj.previewUrl = `/api/v1/templates/${template._id}/preview`;
//   templateObj.id = template._id;
//   templateObj.dateCreated = template.createdAt
//     ? template.createdAt.toISOString().split("T")[0]
//     : "";

//   res.status(200).json({
//     success: true,
//     data: templateObj,
//   });
// });

// // @desc    Update template preview image
// // @route   PUT /api/v1/templates/:id/preview
// // @access  Private/Admin
// exports.updateTemplatePreview = asyncHandler(async (req, res, next) => {
//   let template = await Template.findById(req.params.id);

//   if (!template) {
//     return next(
//       new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
//     );
//   }

//   if (!req.files || !req.files.file) {
//     return next(new ErrorResponse("Please upload a file", 400));
//   }

//   const file = req.files.file;

//   if (!file.mimetype.startsWith("image")) {
//     return next(new ErrorResponse("Please upload an image file", 400));
//   }

//   template.previewImage = {
//     data: Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data),
//     contentType: file.mimetype,
//   };

//   await template.save();

//   // Prepare response object
//   const templateObj = template.toObject();
//   delete templateObj.previewImage?.data;
//   templateObj.previewUrl = `/api/v1/templates/${template._id}/preview`;
//   templateObj.id = template._id;
//   templateObj.dateCreated = template.createdAt
//     ? template.createdAt.toISOString().split("T")[0]
//     : "";

//   res.status(200).json({
//     success: true,
//     data: templateObj,
//   });
// });

// // @desc    Delete template
// // @route   DELETE /api/v1/templates/:id
// // @access  Private/Admin
// exports.deleteTemplate = asyncHandler(async (req, res, next) => {
//   const template = await Template.findById(req.params.id);

//   if (!template) {
//     return next(
//       new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
//     );
//   }

//   await template.remove();

//   res.status(200).json({
//     success: true,
//     data: {},
//   });
// });

// // Export the upload middleware to be used in routes
// exports.upload = upload;
const asyncHandler = require("express-async-handler");
const multer = require("multer");

// Storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Example handlers
const getTemplates = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Get all templates" });
});

const getTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, message: `Get template ${id}` });
});

const createTemplate = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Template created" });
});

const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, message: `Template ${id} updated` });
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, message: `Template ${id} deleted` });
});

const uploadTemplatePreview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Assuming file is uploaded via field 'preview'
  if (!req.files || !req.files.preview) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  // Example response
  res
    .status(200)
    .json({ success: true, message: `Preview uploaded for template ${id}` });
});

// Export all handlers
module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTemplatePreview,
};
