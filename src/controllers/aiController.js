require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Gemini with correct API version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTemplateFromPrompt = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    // Initialize model with correct name
    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro", // Updated model name
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 32,
        maxOutputTokens: 2048,
      },
    });

    // Generate title and category
    const prompt = `Generate a creative poster title and category based on: "${description}".
    Respond in this exact format:
    Title: [Generated Title Here]
    Category: [Generated Category Here]
    
    Make the title catchy and the category relevant to poster design.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response
    const title = text.match(/Title: (.*)/)?.[1]?.trim() || "Custom Poster";
    const category = text.match(/Category: (.*)/)?.[1]?.trim() || "General";

    // Generate placeholder image (since Gemini doesn't create images)
    const placeholderImage = await cloudinary.uploader.upload(
      `https://placehold.co/600x400/EEE/31343C.png?text=${encodeURIComponent(title)}&font=montserrat`,
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
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
