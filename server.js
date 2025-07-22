// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Load admissions data from JSON file
const admissionsData = JSON.parse(fs.readFileSync('./data/admissions.json', 'utf8'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Construct the system prompt
const systemPrompt = `
You are a helpful virtual assistant for Govt. Graduate College Jauharabad.

🎓 Your main role is to assist users with:
- College admissions (Intermediate, ADP, BS)
- Eligibility criteria
- Programs offered
- Fee structure
- Interview and merit list dates
- Class start dates
- Admission process

📚 Use the following official admissions data:
${JSON.stringify(admissionsData, null, 2)}

🤖 If the user's question is too broad, like “Tell me about FSc” or “What’s the admission info?”, you should:
- Politely ask clarifying follow-up questions like:
  - “Which specific detail would you like to know about? Eligibility? Fee? Admission dates?”
- Only give full details after the user specifies what they need.

⚠️ Never respond with long paragraphs if the question is vague or general.

🌐 Language: Respond in **Urdu** or **English**, matching the user's language. Do not use Arabic or Chinese.

🚫 If someone asks about unrelated topics (politics, celebrities, weather, religion), reply:
"I'm here to help only with college-related questions."

Be warm, brief, and conversational.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Detect if the input is in Urdu (using Arabic script range)
  const isUrdu = /[\u0600-\u06FF]/.test(userMessage);

  // Add language-specific instruction
  const languageInstruction = isUrdu
    ? "جواب صرف اردو میں اور نرم انداز میں دیں۔"
    : "Please respond only in polite, fluent English.";

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${languageInstruction}\n\n${userMessage}` }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("❌ Error calling OpenRouter API:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with the chatbot." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
