require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTemplateFromPrompt = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate title and category
    const prompt = `Generate a creative poster title and category based on: "${description}".
    Respond in this exact format:
    Title: [Generated Title Here]
    Category: [Generated Category Here]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response
    const title = text.match(/Title: (.*)/)?.[1]?.trim() || "Custom Poster";
    const category = text.match(/Category: (.*)/)?.[1]?.trim() || "General";

    // For image generation - using placeholder since Gemini doesn't generate images
    // In production, integrate Stable Diffusion or DALL-E here
    const placeholderImage = await cloudinary.uploader.upload(
      "https://placehold.co/600x400/EEE/31343C?font=montserrat&text=Poster+Image",
      { folder: "poster-templates" }
    );

    res.json({
      success: true,
      title,
      category,
      imageUrl: placeholderImage.secure_url,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({
      success: false,
      error: "AI generation failed",
      details: error.message,
    });
  }
};
