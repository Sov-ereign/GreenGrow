import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const getGroqApiKey = () =>
  process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

export const getGroqModel = (fallback) =>
  process.env.GROQ_MODEL || fallback;

export const getMessageText = (data) =>
  data?.choices?.[0]?.message?.content || "";

export async function createChatCompletion({
  messages,
  model,
  temperature,
  response_format,
  max_completion_tokens,
}) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const payload = { model, messages };
  if (typeof temperature === "number") {
    payload.temperature = temperature;
  }
  if (typeof max_completion_tokens === "number") {
    payload.max_completion_tokens = max_completion_tokens;
  }
  if (response_format) {
    payload.response_format = response_format;
  }

  const response = await axios.post(GROQ_API_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.data;
}
