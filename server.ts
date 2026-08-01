import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for handling photo uploads (up to 25MB base64)
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Helper to initialize Gemini client on demand
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment settings.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Time Travel Transformation Route
  app.post("/api/time-travel", async (req, res) => {
    try {
      const {
        userImage,
        era,
        customPrompt,
        style = "photorealistic",
        aspectRatio = "1:1",
      } = req.body;

      if (!userImage) {
        return res.status(400).json({ error: "A user photo is required for time travel." });
      }

      const ai = getGeminiClient();

      // Clean base64 data
      let mimeType = "image/jpeg";
      let base64Data = userImage;

      if (userImage.includes(";base64,")) {
        const parts = userImage.split(";base64,");
        const match = parts[0].match(/data:(.*?)$/);
        if (match) mimeType = match[1];
        base64Data = parts[1];
      }

      // Step 1: Analyze user's face features with Gemini Flash to ensure facial fidelity
      let faceAnalysis = "A portrait photo of a person.";
      try {
        const analysisRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: "Analyze the key facial attributes of the person in this photo in 2 brief sentences (facial structure, hair color/style, eye shape, age group, expression, gender presentation) so we preserve their exact identity in a portrait transformation.",
              },
            ],
          },
        });
        if (analysisRes.text) {
          faceAnalysis = analysisRes.text.trim();
        }
      } catch (analysisErr) {
        console.warn("Face analysis non-fatal warning:", analysisErr);
      }

      // Step 2: Build detailed transformation prompt
      const eraTitle = era?.name || "Historical Era";
      const eraPeriod = era?.period || "Past";
      const eraPrompt = era?.prompt || "Authentic historical clothing and scenery.";
      const eraStyle = era?.styleInstruction || "Photorealistic historical photo with period lighting.";

      const fullPrompt = `You are an expert AI photo-booth artist specializing in historical time-travel transformations.

Input image contains the user's face.
FACIAL DETAILS TO PRESERVE EXACTLY:
${faceAnalysis}

TASK:
Seamlessly place this exact person's face into the historical era: ${eraTitle} (${eraPeriod}).

STYLING REQUIREMENTS:
- Keep the face, facial structure, features, hairstyle, and expression of the person in the provided photo recognizable.
- Replace modern clothing with authentic ${eraTitle} historical garments (${eraPrompt}).
- Set the background in a rich, detailed ${eraTitle} setting with historic architecture and ambiance.
- Visual Art Style: ${style} (${eraStyle}).
${customPrompt ? `- Custom User Directives: ${customPrompt}` : ""}
- Render as a single high-quality, vivid, dramatic photobooth portrait.`;

      // Generate Image using gemini-3.1-flash-image
      let generatedImageUrl: string | null = null;
      let usedModel = "gemini-3.1-flash-image";

      try {
        const imageRes = await ai.models.generateContent({
          model: usedModel,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: "1K",
            },
          },
        });

        if (imageRes.candidates?.[0]?.content?.parts) {
          for (const part of imageRes.candidates[0].content.parts) {
            if (part.inlineData) {
              generatedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (imgErr) {
        console.warn("Primary image model warning, attempting fallback model:", imgErr);
      }

      // Fallback if needed
      if (!generatedImageUrl) {
        usedModel = "gemini-3.1-flash-lite-image";
        const fallbackRes = await ai.models.generateContent({
          model: usedModel,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        });

        if (fallbackRes.candidates?.[0]?.content?.parts) {
          for (const part of fallbackRes.candidates[0].content.parts) {
            if (part.inlineData) {
              generatedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      }

      if (!generatedImageUrl) {
        throw new Error("Unable to generate historical image output. Please ensure the prompt or image is valid and try again.");
      }

      // Step 3: Generate Historical Traveler Passport details
      let passportCard = null;
      try {
        const cardRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Create an authentic and entertaining Time Traveler Passport Card in JSON format for a person transported to ${eraTitle} (${eraPeriod}).
User details: ${customPrompt || "Standard Time Jump"}
Facial features: ${faceAnalysis}

Return ONLY valid JSON matching this structure:
{
  "alias": "Historical honorific title & name (e.g. Lord Masum of Alexandria or Captain Masum)",
  "assignedRole": "Your societal role in this era",
  "year": "Specific year like 1345 AD, 1925, or 2087",
  "location": "Historic location name",
  "outfitDescription": "Short description of your historic attire",
  "survivalScore": 92,
  "survivalTip": "A witty advice for surviving in this era",
  "historicalFacts": [
    "Historic fact 1 about this era/year",
    "Historic fact 2 about daily life or culture",
    "Historic fact 3 about notable events"
  ],
  "quote": "A catchy period-appropriate motto or quote"
}`,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (cardRes.text) {
          passportCard = JSON.parse(cardRes.text.trim());
        }
      } catch (cardErr) {
        console.warn("Passport generation warning:", cardErr);
      }

      res.json({
        success: true,
        resultImage: generatedImageUrl,
        faceAnalysis,
        passportCard,
        era: eraTitle,
        usedModel,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Time travel handler error:", err);
      res.status(500).json({
        error: err?.message || "An unexpected error occurred during time travel processing.",
      });
    }
  });

  // Face Analysis Endpoint
  app.post("/api/analyze-face", async (req, res) => {
    try {
      const { userImage } = req.body;
      if (!userImage) return res.status(400).json({ error: "User image is required" });

      const ai = getGeminiClient();
      let mimeType = "image/jpeg";
      let base64Data = userImage;

      if (userImage.includes(";base64,")) {
        const parts = userImage.split(";base64,");
        const match = parts[0].match(/data:(.*?)$/);
        if (match) mimeType = match[1];
        base64Data = parts[1];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            {
              text: `Perform a fun photobooth facial analysis of this image.
Return JSON ONLY:
{
  "features": "Brief summary of key facial features",
  "mood": "Detected facial expression / vibe",
  "recommendedEras": ["Ancient Rome 50 AD", "1920s Roaring Twenties", "Cyberpunk 2087", "Victorian Steampunk"],
  "historicalMatch": "The single historical archetype this person looks most like"
}`,
            },
          ],
        },
        config: { responseMimeType: "application/json" },
      });

      const analysis = response.text ? JSON.parse(response.text.trim()) : null;
      res.json({ success: true, analysis });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to analyze photo" });
    }
  });

  // Serve Vite app in development or static dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Time-Travel Photo Booth server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
