require("dotenv").config();
const { OpenAI } = require("openai");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateTemplateFromPrompt = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    // Generate title and category
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative assistant that generates poster templates. Respond with only the title on the first line and category on the second line. Keep them concise.",
        },
        {
          role: "user",
          content: `Generate a poster template based on: ${description}`,
        },
      ],
      max_tokens: 100,
    });

    const responseText = chatCompletion.choices[0].message.content;
    const [title, category] = responseText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    if (!title || !category) {
      throw new Error("Failed to generate title and category");
    }

    // Generate image using DALL·E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A professional poster design about: ${description}. Minimalist, high quality, suitable for business or event.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = imageResponse.data[0].url;

    // Upload to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
      folder: "poster-templates",
      resource_type: "image",
    });

    res.json({
      success: true,
      title,
      category,
      imageUrl: uploadedImage.secure_url,
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
