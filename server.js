const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Try loading .env (only for local dev)
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY not found. Add it in .env (local) or Render Environment Variables.");
  process.exit(1);
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "user", parts: [{ text: userMessage }] }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
