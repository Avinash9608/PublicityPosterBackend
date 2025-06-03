// // src/routes/admin.routes.js
// const express = require("express");
// const router = express.Router();
// const { protect, authorize } = require("../middlewares/auth");
// const User = require("../models/User");
// const { KYC_STATUS } = require("../config/constants");

// // Get pending KYC applications
// router.get("/kyc/pending", protect, authorize("admin"), async (req, res) => {
//   try {
//     const pendingUsers = await User.find({
//       kycStatus: KYC_STATUS.PENDING,
//     }).select("-password");

//     res.status(200).json({
//       success: true,
//       count: pendingUsers.length,
//       data: pendingUsers,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch pending KYC applications",
//     });
//   }
// });

// // Approve/Reject KYC
// router.put("/kyc/:id", protect, authorize("admin"), async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (![KYC_STATUS.APPROVED, KYC_STATUS.REJECTED].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Use "approved" or "rejected"',
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { kycStatus: status },
//       { new: true }
//     ).select("-password");

//     // TODO: Add WhatsApp notification here

//     res.status(200).json({
//       success: true,
//       message: `KYC ${status} successfully`,
//       data: user,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update KYC status",
//     });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
// const { protect, authorize } = require("../middlewares/auth");
const User = require("../models/User");
const { sendWhatsAppMessage } = require("../utils/whatsappService");
// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// router.get("/users", async (req, res) => {
//   try {
//     const users = await User.find(
//       {},
//       "username email kycStatus kycDocs createdAt"
//     ).sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     console.error("Admin get users error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching users",
//     });
//   }
// });
// Update the GET /users route to include all fields
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select(
        "username email role kycStatus aadhaarNumber dateOfBirth gender mobileNumber documentType documentFront documentBack selfie createdAt"
      )
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
});
// @route   PATCH /api/admin/users/:userId/kyc
// @desc    Update KYC status (admin only)
// router.patch(
//   "/users/:userId/kyc",

//   async (req, res) => {
//     try {
//       const { status } = req.body;
//       const { userId } = req.params;

//       if (!["approved", "rejected", "pending"].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid status value",
//         });
//       }

//       const user = await User.findByIdAndUpdate(
//         userId,
//         { kycStatus: status },
//         { new: true, select: "username email kycStatus kycDocs" }
//       );

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       // Send WhatsApp notification
//       if (user.mobileNumber) {
//         try {
//           const message =
//             status === "approved"
//               ? `Hello ${user.username}, your KYC has been approved! You can now access all features.`
//               : `Hello ${user.username}, your KYC application requires additional verification. Please check your email for details.`;

//           await sendWhatsAppMessage(user.mobileNumber, message);
//         } catch (err) {
//           console.error("Failed to send WhatsApp notification:", err);
//         }
//       }

//       res.json({
//         success: true,
//         user,
//         message: `KYC status updated to ${status}`,
//       });
//     } catch (err) {
//       console.error("Admin update KYC error:", err);
//       res.status(500).json({
//         success: false,
//         message: "Server error while updating KYC status",
//       });
//     }
//   }
// );
router.patch("/users/:userId/kyc", async (req, res) => {
  try {
    const { status } = req.body;
    const { userId } = req.params;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Get the full user document including mobileNumber
    const user = await User.findByIdAndUpdate(
      userId,
      { kycStatus: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send WhatsApp notification
    if (user.mobileNumber) {
      try {
        const message =
          status === "approved"
            ? `Hello ${user.username}, your KYC has been approved! You can now access all features.`
            : `Hello ${user.username}, your KYC application requires additional verification. Please check your email for details.`;

        console.log(`Sending WhatsApp to ${user.mobileNumber}`);
        await sendWhatsAppMessage(user.mobileNumber, message);
      } catch (err) {
        console.error("WhatsApp Error Details:", {
          code: err.code,
          message: err.message,
          mobileNumber: user.mobileNumber,
          status: status,
        });
      }
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        kycStatus: user.kycStatus,
        kycDocs: user.kycDocs,
      },
      message: `KYC status updated to ${status}`,
    });
  } catch (err) {
    console.error("Admin update KYC error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating KYC status",
    });
  }
});
module.exports = router;
