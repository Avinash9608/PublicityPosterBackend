const { GoogleGenerativeAI } = require("@google/generative-ai");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

// Configure Cloudinary
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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate AI image using alternative service since Gemini doesn't support image generation
async function generateAIImage(prompt) {
  try {
    // Using Stable Diffusion API as fallback
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
      }
    );

    return response.data.artifacts[0].base64;
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw new Error("Failed to generate AI image");
  }
}

exports.generateTemplateFromPrompt = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: "Description is required",
      });
    }

    // Initialize model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    // Generate title and category
    const prompt = `Generate a poster template based on: "${description}".
    Respond in this exact format:
    Title: [Generated Title Here]
    Category: [Generated Category Here]
    
    Requirements:
    - Title should be 2-5 words
    - Category should be 1-2 words
    - Both should be relevant to poster design`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response
    const titleMatch = text.match(/Title:\s*(.+)/i);
    const categoryMatch = text.match(/Category:\s*(.+)/i);

    const title = titleMatch?.[1]?.trim() || "Custom Poster";
    const category = categoryMatch?.[1]?.trim() || "General";

    // Generate AI image
    const imagePrompt = `Professional poster design about: ${description}. Minimalist style, high quality, suitable for printing`;
    const imageBase64 = await generateAIImage(imagePrompt);

    // Upload to Cloudinary
    let imageUrl;
    try {
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        {
          folder: "poster-templates",
          resource_type: "image",
        }
      );
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      throw new Error("Failed to upload generated image");
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
      error: "AI generation failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const Template = require("../models/Template");
// const cloudinary = require("cloudinary").v2;

exports.createTemplate = async (req, res) => {
  try {
    const { title, category, imageUrl } = req.body;

    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if image is base64 (manual upload) or URL (AI generated)
    let uploadedResponse;
    if (imageUrl.startsWith("data:image")) {
      // Handle base64 upload
      uploadedResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "templates",
        resource_type: "auto",
      });
    } else {
      // Handle direct URL (from AI generation)
      uploadedResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "templates",
      });
    }

    const newTemplate = await Template.create({
      title,
      category,
      imageUrl: uploadedResponse.secure_url,
      cloudinaryId: uploadedResponse.public_id,
    });

    res.status(201).json(newTemplate);
  } catch (err) {
    console.error("Error creating template:", err);
    res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
};
