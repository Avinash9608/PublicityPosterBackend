const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendWhatsAppMessage = async (to, message) => {
  try {
    // Format the number correctly
    let formattedTo = to;

    // Remove any non-digit characters
    formattedTo = formattedTo.replace(/\D/g, "");

    // Add country code if missing (assuming India +91)
    if (!formattedTo.startsWith("91") && formattedTo.length === 10) {
      formattedTo = `91${formattedTo}`;
    }

    // Ensure it starts with +
    if (!formattedTo.startsWith("+")) {
      formattedTo = `+${formattedTo}`;
    }

    // Add whatsapp: prefix
    formattedTo = `whatsapp:${formattedTo}`;

    console.log(`Attempting to send to: ${formattedTo}`); // Debug log

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
    });

    console.log("Message SID:", result.sid);
    return result;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
};
