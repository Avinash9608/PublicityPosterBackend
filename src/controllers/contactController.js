const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email and message are required fields",
      });
    }

    const newContact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

exports.sendReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    // Send email
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: `Re: ${contact.subject || "Your Inquiry"}`,
      text: replyMessage,
      html: `<p>${replyMessage.replace(/\n/g, "<br>")}</p>`,
    });

    res.status(200).json({
      success: true,
      data: { message: "Reply sent successfully" },
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send reply",
    });
  }
};
