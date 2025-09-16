// script.js - Study Buddy chatbot (dummy + Gemini API integration)

// Select elements
const messagesEl = document.getElementById('messages');
const form = document.getElementById('input-form');
const input = document.getElementById('input');

// Utility: add a message to the chat window
function addMessage(text, sender = 'bot') {
  const el = document.createElement('div');
  el.className = `message ${sender}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Initial greeting from the bot
addMessage("I'm your Study Buddy 👩🏻‍🏫 — strict but fair. Ask your question or type 'help'.", 'bot');

// Dummy logic for testing without API
function getDummyReply(userText) {
  const t = userText.trim().toLowerCase();
  if (!t) return "Speak up. What do you want to study?";
  if (t.includes('hello') || t.includes('hi')) return "Hello. Focus. What's the topic?";
  if (t.includes('help')) return "Tell me the subject (e.g., physics, maths) and the specific topic.";
  // fallback
  return "Good question. Summarize your problem in one sentence and I will guide you.";
}

// ===========================
// 🔽 SWITCH BETWEEN MODES HERE
// ===========================
// false = dummy replies (safe for testing)
// true  = real Gemini API via your server.js
const USE_API = true;

// Form submit handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user'); // show user's message
  input.value = '';

  // "thinking..." placeholder
  const thinking = document.createElement('div');
  thinking.className = 'message bot';
  thinking.textContent = '...';
  messagesEl.appendChild(thinking);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    let reply;
    if (USE_API) {
      // Call your backend (server.js handles Gemini API)
      reply = await callApiViaServer(text);
    } else {
      // Dummy local reply
      await new Promise(r => setTimeout(r, 600)); // delay for realism
      reply = getDummyReply(text);
    }
    thinking.textContent = reply;
  } catch (err) {
    console.error(err);
    thinking.textContent = "⚠️ Error: couldn't get a reply. Check the console.";
  }
});

// Function to call your backend API
async function callApiViaServer(userMessage) {
  try {
    const res = await fetch('/api/chat', {  // same origin; served by Express
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },  // ✅ fixed here
      body: JSON.stringify({ message: userMessage })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server returned ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.reply || "No reply received from server.";
  } catch (error) {
    console.error("Error calling backend API:", error);
    throw error;
  }
}

/* 
⚠️ SECURITY NOTE:
- Never paste your Gemini API key here in script.js.
- The key must stay hidden in your .env file (server side).
- script.js should only talk to your server at /api/chat.
*/
