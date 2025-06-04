const express = require("express");
const router = express.Router();
const {
  createContact,
  getAllContacts,
  deleteContact,
  sendReply,
} = require("../controllers/contactController");

// Create new contact
router.post("/", createContact);

// Get all contacts (for admin purposes)
router.get("/", getAllContacts);

// Delete contact
router.delete("/:id", deleteContact);

// Send reply
router.post("/:id/reply", sendReply);
module.exports = router;
