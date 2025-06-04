const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary safely
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Initialize Gemini with proper error handling
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key");
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("❌ Gemini initialization failed:", error.message);
}

exports.generateTemplateFromPrompt = async (req, res) => {
  // Immediate validation
  if (!genAI) {
    return res.status(500).json({
      success: false,
      error: "AI service not configured",
      details: "Gemini API is not properly initialized",
    });
  }

  if (!req.body?.description) {
    return res.status(400).json({
      success: false,
      error: "Description is required",
    });
  }

  try {
    // Get the model with proper configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", // Updated to latest model
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    // Enhanced prompt with strict formatting
    const prompt = `Generate exactly two lines:
    Line 1 must start with "Title: " followed by a 2-5 word poster title
    Line 2 must start with "Category: " followed by a 1-2 word category
    
    Based on this description: "${req.body.description}"`;

    // Execute generation with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI timeout")), 10000)
      ),
    ]);

    const response = await result.response;
    const text = response.text();

    // Robust response parsing
    const [titleLine, categoryLine] = text.split("\n").filter((l) => l.trim());
    const title = titleLine?.replace("Title:", "").trim() || "New Poster";
    const category = categoryLine?.replace("Category:", "").trim() || "General";

    // Image handling with fallback
    let imageUrl;
    try {
      if (cloudinary.config().cloud_name) {
        const uploadResult = await cloudinary.uploader.upload(
          `https://placehold.co/600x400?text=${encodeURIComponent(title)}`,
          { folder: "poster-templates" }
        );
        imageUrl = uploadResult.secure_url;
      } else {
        imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;
      }
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;
    }

    return res.json({
      success: true,
      title,
      category,
      imageUrl,
    });
  } catch (error) {
    console.error("🚨 AI Generation Error:", error);
    return res.status(500).json({
      success: false,
      error: "AI processing failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      suggestion: "Please try again with a different description",
    });
  }
};
