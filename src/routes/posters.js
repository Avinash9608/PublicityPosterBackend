// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middlewares/auth");
// const Poster = require("../models/Poster");
// const { sendWhatsAppMessage } = require("../utils/whatsappService");

// // Save poster and send WhatsApp message
// router.post("/", protect, async (req, res) => {
//   try {
//     const { templateId, businessName, phoneNumber, logoUrl, finalPosterUrl } =
//       req.body;

//     const poster = new Poster({
//       user: req.user.id,
//       template: templateId,
//       businessName,
//       phoneNumber,
//       logoUrl,
//       finalPosterUrl,
//     });

//     await poster.save();

//     // ✅ Use your utility to send the WhatsApp message
//     // Send WhatsApp message
//     try {
//       if (req.user.mobileNumber) {
//         // Changed from phoneNumber to mobileNumber
//         await sendWhatsAppMessage(
//           req.user.mobileNumber, // Using mobileNumber from user object
//           `Your poster "${businessName}" has been successfully created! `
//         );
//         console.log("WhatsApp message sent to:", req.user.mobileNumber);
//       } else {
//         console.log(
//           "No mobile number found for user, skipping WhatsApp message"
//         );
//       }
//     } catch (twilioError) {
//       console.error("Twilio error:", twilioError);
//     }

//     res.json(poster);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// // Get user's posters
// router.get("/my-posters", protect, async (req, res) => {
//   try {
//     const posters = await Poster.find({ user: req.user.id })
//       .populate("template", "title imageUrl")
//       .sort({ createdAt: -1 });

//     res.json(posters);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// // Public route to get all posters (for admin)
// router.get("/", async (req, res) => {
//   try {
//     const posters = await Poster.find()
//       .populate("template", "title")
//       .sort({ createdAt: -1 });

//     res.json(posters);
//   } catch (err) {
//     console.error("Error fetching all posters:", err.message);
//     res.status(500).send("Server Error");
//   }
// });

// // Add to your posters routes
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const poster = await Poster.findById(req.params.id);

//     if (!poster) {
//       return res.status(404).json({ message: "Poster not found" });
//     }

//     // Check if the user owns the poster
//     if (poster.user.toString() !== req.user.id) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     await poster.remove();
//     res.json({ message: "Poster removed" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });
// module.exports = router;
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const Poster = require("../models/Poster");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

// POST /api/posters - Protected (user must be logged in)
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

    // WhatsApp message (optional)
    try {
      if (req.user.mobileNumber) {
        await sendWhatsAppMessage(
          req.user.mobileNumber,
          `Your poster "${businessName}" has been successfully created!`
        );
        console.log("WhatsApp message sent to:", req.user.mobileNumber);
      } else {
        console.log("No mobile number found for user");
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

// GET /api/posters/my-posters - Protected (get posters of logged-in user)
// router.get("/my-posters", async (req, res) => {
//   try {
//     const posters = await Poster.find({ user: req.user.id })
//       .populate("template", "title imageUrl")
//       .sort({ createdAt: -1 });

//     res.json(posters);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// GET /api/posters - Public (Admin fetch all posters)
router.get("/", async (req, res) => {
  try {
    const posters = await Poster.find()
      .populate("template", "title")
      .sort({ createdAt: -1 });

    res.json(posters);
  } catch (err) {
    console.error("Error fetching all posters:", err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/posters/:id - Public (admin can delete any poster)
// If you want to restrict this, use admin middleware instead of `protect`
router.delete("/:id", async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id);

    if (!poster) {
      return res.status(404).json({ message: "Poster not found" });
    }

    await poster.remove();
    res.json({ message: "Poster deleted successfully" });
  } catch (err) {
    console.error("Error deleting poster:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
