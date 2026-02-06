import express from 'express';
import {
  createChatCompletion,
  getGroqModel,
  getMessageText,
} from "../services/groqClient.js";
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const prompt =
      `Generate 4 short news headlines about today's mandi market prices in India. ` +
      `Include crop trends, price changes, and government updates. ` +
      `For each headline, provide a title, a time (e.g., "Today", "1h ago"), ` +
      `and an impact ("positive", "negative", or "neutral") based on the headline's sentiment.`;

    const responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "mandi_news",
        strict: false,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              time: { type: "string" },
              impact: { type: "string" },
            },
            required: ["title", "time", "impact"],
          },
        },
      },
    };

    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content:
            "You generate short, factual-looking mandi market headlines. Output valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 300,
      response_format: responseFormat,
    });

    const jsonText = getMessageText(data);
    if (!jsonText) {
      throw new Error("Invalid response structure from Groq");
    }

    const newsData = JSON.parse(jsonText);
    res.json({ news: newsData });

  } catch (err) {
    let errorMessage = err.message;
    if (err.response?.data?.error) {
        errorMessage = err.response.data.error.message;
    } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
    }
    console.error('Error generating news:', errorMessage);
    res.status(500).json({ error: 'Failed to generate news' });
  }
});

export default router;

