import express from "express";
import {
  createChatCompletion,
  getGroqModel,
  getMessageText,
} from "../services/groqClient.js";
import twilio from "twilio";

const router = express.Router();

const LANGUAGE_MAP = {
  "1": { name: "English", code: "en-IN" },
  "2": { name: "Hindi", code: "hi-IN" },
  "3": { name: "Bengali", code: "bn-IN" },
};

const xmlEscape = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const say = (text, lang) =>
  `<Say${lang ? ` language="${lang}"` : ""}>${xmlEscape(text)}</Say>`;

const gather = (inner, attrs = {}) => {
  const attrString = Object.entries(attrs)
    .map(([key, val]) => ` ${key}="${xmlEscape(String(val))}"`)
    .join("");
  return `<Gather${attrString}>${inner}</Gather>`;
};

const twiml = (body) =>
  `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;

const getAiResponse = async (message, languageName) => {
  const prompt = `You are GreenGrow's IVR assistant for farmers in India.
Respond in ${languageName}.
Keep it concise (1-2 sentences), friendly, and practical.`;

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: message },
  ];

  const data = await createChatCompletion({
    model: getGroqModel("llama-3.1-8b-instant"),
    messages,
    temperature: 0.3,
    max_completion_tokens: 120,
  });

  return getMessageText(data) || "I'm sorry, I couldn't generate a response.";
};

router.get("/token", (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      return res.status(500).json({
        error: "Twilio credentials not configured",
      });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const rawIdentity =
      (req.query.identity && String(req.query.identity)) || "greengrow-web";
    const identity = rawIdentity.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600,
    });
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt() });
  } catch (err) {
    console.error("Failed to generate Twilio token:", err);
    res.status(500).json({ error: "Failed to generate Twilio token" });
  }
});

// Entry point: language selection
router.post("/voice", (req, res) => {
  const prompt = [
    "Welcome to GreenGrow.",
    "For English, press 1.",
    "Hindi ke liye 2 dabayein.",
    "Bangla er jonno 3 chapun.",
  ].join(" ");

  const body = gather(say(prompt), {
    input: "dtmf",
    numDigits: 1,
    action: "/api/ivr/language",
    method: "POST",
  });

  const response = twiml(`${body}${say("We did not receive any input. Goodbye.")}<Hangup/>`);
  res.type("text/xml").send(response);
});

// Handle language choice and prompt for speech
router.post("/language", (req, res) => {
  const digits = req.body.Digits || "";
  const lang = LANGUAGE_MAP[digits] || LANGUAGE_MAP["1"];

  const prompt =
    lang.code === "hi-IN"
      ? "Kripya apna sawaal poochhiye. Aap band karne ke liye 9 dabaa sakte hain."
      : lang.code === "bn-IN"
      ? "Doya kore apnar prosno bolun. Shesh korte 9 chapun."
      : "Please ask your question. Press 9 to end.";

  const body = gather(say(prompt, lang.code), {
    input: "speech dtmf",
    numDigits: 1,
    language: lang.code,
    speechTimeout: "auto",
    action: `/api/ivr/ask?lang=${lang.code}`,
    method: "POST",
  });

  const response = twiml(body);
  res.type("text/xml").send(response);
});

// Handle speech, call AI, then continue or end
router.post("/ask", async (req, res) => {
  const langCode = req.query.lang || "en-IN";
  const language =
    Object.values(LANGUAGE_MAP).find((l) => l.code === langCode) ||
    LANGUAGE_MAP["1"];

  if (req.body.Digits === "9") {
    const response = twiml(`${say("Goodbye.", langCode)}<Hangup/>`);
    res.type("text/xml").send(response);
    return;
  }

  const speech = req.body.SpeechResult;
  if (!speech) {
    const retryPrompt =
      langCode === "hi-IN"
        ? "Mujhe samajh nahi aaya. Kripya dobara boliye."
        : langCode === "bn-IN"
        ? "Ami bujhte parini. Doya kore abar bolun."
        : "I didn't catch that. Please say it again.";

    const body = gather(say(retryPrompt, langCode), {
      input: "speech dtmf",
      numDigits: 1,
      language: langCode,
      speechTimeout: "auto",
      action: `/api/ivr/ask?lang=${langCode}`,
      method: "POST",
    });

    res.type("text/xml").send(twiml(body));
    return;
  }

  let aiText;
  try {
    aiText = await getAiResponse(speech, language.name);
  } catch (err) {
    console.error("IVR AI error:", err.response?.data || err.message);
    aiText =
      langCode === "hi-IN"
        ? "Maaf kijiye, abhi jawab nahi de pa raha hoon."
        : langCode === "bn-IN"
        ? "Dukkhoito, ami ekhon uttor dite parchi na."
        : "Sorry, I cannot answer right now.";
  }

  const followUp =
    langCode === "hi-IN"
      ? "Agar aap aur sawal poochna chahte hain to boliye, ya 9 dabakar call band karein."
      : langCode === "bn-IN"
      ? "Aro prosno thakle bolun, ba call shesh korte 9 chapun."
      : "You can ask another question, or press 9 to end.";

  const body = [
    say(aiText, langCode),
    gather(say(followUp, langCode), {
      input: "speech dtmf",
      numDigits: 1,
      language: langCode,
      speechTimeout: "auto",
      action: `/api/ivr/ask?lang=${langCode}`,
      method: "POST",
    }),
    say("Goodbye.", langCode),
    "<Hangup/>",
  ].join("");

  res.type("text/xml").send(twiml(body));
});

export default router;
