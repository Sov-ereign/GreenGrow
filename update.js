const fs = require('fs');
const path = 'Server/src/routes/chatRoutes.js';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  /STRICT RESPONSE FORMAT \(Markdown\):[\s\S]*?Keep the answer focused, practical, and easy to follow\./,
  `STRICT RESPONSE FORMAT (JSON):
Return a valid JSON object exactly like this:
{
  "chatMessage": "A friendly 3-4 sentence message explaining the detected issue, what it is, and what to watch out for. Use markdown formatting.",
  "careActions": [
    "Short actionable step 1 (one sentence).",
    "Short actionable step 2 (one sentence).",
    "Short actionable step 3 (one sentence)."
  ]
}
Do NOT wrap the JSON in markdown code blocks. Just output raw JSON.`
);

c = c.replace(
  /When you fill the sections above for a healthy plant:[\s\S]*?only if new symptoms appear\./,
  `When you generate the JSON for a healthy plant:
- In "chatMessage", clearly say there is no disease detected.
- In "careActions", give 3 short preventive care tips (watering, spacing, monitoring). DO NOT recommend any pesticides.`
);

c = c.replace(
  /When you write \*\*Detected issue\*\*, use a clean, human-friendly name without underscores,[\s\S]*?instead of "Tomato___Tomato_Yellow_Leaf_Curl_Virus"\./,
  `When you generate the JSON:
- In "chatMessage", use the human-friendly name without underscores.`
);

c = c.replace(
  /    let aiText =[\s\S]*?\} catch \(groqErr\) \{\n      console\.error\("Groq API error:", groqErr\.response\?\.data \|\| groqErr\.message\);\n    \}/,
  `    let aiText =
      "I couldn't analyze the image. Please try again with a clearer photo.";
    let generatedCareActions = [];
    try {
      const data = await createChatCompletion({
        model: getGroqModel("llama-3.1-8b-instant"),
        messages,
        temperature: 0.2,
        max_completion_tokens: 512,
        response_format: { type: "json_object" }
      });
      const responseContent = getMessageText(data) || "{}";
      const parsed = JSON.parse(responseContent);
      if (parsed.chatMessage) aiText = parsed.chatMessage;
      if (Array.isArray(parsed.careActions)) {
        generatedCareActions = parsed.careActions;
      }
    } catch (groqErr) {
      console.error("Groq JSON parsing error:", groqErr.response?.data || groqErr.message);
    }`
);

c = c.replace(
  /    const assessment = await PlantAssessment\.create\(\{[\s\S]*?careActions: followUpPlan\.careActions,/,
  `    // Use generated care actions if available, fallback to computed ones
    const finalCareActions = generatedCareActions.length > 0 ? generatedCareActions : followUpPlan.careActions;

    const assessment = await PlantAssessment.create({
      plant: plant._id,
      image: plantImage._id,
      symptomsDetected: [],
      diseasePrediction: diseasePredictionValue,
      confidenceScore: numericConfidence,
      severity,
      recommendations: [aiText],
      careActions: finalCareActions,`
);

fs.writeFileSync(path, c);
console.log('done');
