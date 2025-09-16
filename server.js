const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load .env variables
const envResult = dotenv.config();
if (envResult.error) {
  console.error("❌ ERROR: .env file not found. Please create one with GEMINI_API_KEY.");
  process.exit(1); // Exit immediately
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY not found in .env file");
  process.exit(1); // Exit immediately
} else {
  console.log("✅ GEMINI_API_KEY loaded");
}

const app = express();
app.use(express.json());

// 👉 Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ API route
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("📩 Incoming user message:", userMessage);

    const systemPrompt = `
You are a strict study companion chatbot.
- Always answer like a tough teacher or mentor.
- Do not allow chit-chat or unrelated topics.
- Push the student to focus on studies.
- Give step-by-step explanations.
- Correct mistakes firmly but clearly.
- Encourage discipline and practice.
`;

    // Gemini API request
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] }, // system-like message
            { role: "user", parts: [{ text: userMessage }] }   // actual user message
          ],
        }),
      }
    );

    console.log("🌐 Gemini API status:", response.status);

    const data = await response.json();
    console.log("📦 Gemini raw response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({
        reply: "Server error from Gemini",
        error: data,
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No reply received from Gemini.";

    res.json({ reply });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ reply: "Server error. Try again later." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
