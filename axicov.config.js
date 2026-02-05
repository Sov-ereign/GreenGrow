/**
 * Axicov Configuration for GreenGrow
 *
 * This configuration defines how Axicov will manage and deploy
 * the AI workflows for the GreenGrow farming platform.
 *
 * Located in project root to avoid ES module conflicts with server/package.json
 */

module.exports = {
  name: "greengrow-ai",
  description:
    "AI-powered farming assistant platform with disease detection and chat capabilities",
  env: "./server/.env",
  params: {
    version: "1.0.0",
    author: "GreenGrow Team",
    license: "MIT",
    // Project-specific metadata
    projectType: "agriculture",
    aiFeatures: [
      "disease-detection",
      "chat-assistant",
      "voice-assistant",
      "image-analysis",
    ],
    models: ["tensorflow", "gemini-2.5-flash"],
  },
  port: 5000,
  tags: [
    "agriculture",
    "farming",
    "ai",
    "disease-detection",
    "gemini",
    "tensorflow",
    "nodejs",
    "flask",
  ],

  // Workflow definitions
  workflows: {
    // Text chat workflow
    "chat-text": {
      name: "Farming Chat Assistant",
      description:
        "AI farming advisor for crop cultivation, weather, disease prevention, and agriculture best practices",
      endpoint: "/api/chat/message",
      method: "POST",
      model: "gemini-2.5-flash",
      type: "text-generation",
    },

    // Image analysis workflow (combines disease detection + Gemini vision)
    "image-analysis": {
      name: "Plant Image Analysis",
      description:
        "Combines TensorFlow disease detection with Gemini vision for comprehensive plant health analysis",
      endpoint: "/api/chat/image-analysis",
      method: "POST",
      models: ["tensorflow", "gemini-2.5-flash"],
      type: "multi-model-orchestration",
      steps: [
        {
          name: "disease-detection",
          model: "tensorflow",
          description: "Detect plant diseases using TensorFlow model",
        },
        {
          name: "visual-analysis",
          model: "gemini-2.5-flash",
          description: "Analyze image with Gemini vision API",
        },
      ],
    },

    // Voice command interpretation
    "voice-command": {
      name: "Voice Command Processor",
      description:
        "Interprets voice commands and determines navigation/actions",
      endpoint: "/api/chat/voice-command",
      method: "POST",
      model: "gemini-2.5-flash",
      type: "command-interpretation",
    },

    // Live voice conversation with context
    "live-voice": {
      name: "Live Voice Assistant",
      description:
        "Real-time voice conversation with access to weather, market, and news data",
      endpoint: "/api/chat/live-voice",
      method: "POST",
      model: "gemini-2.5-flash",
      type: "contextual-chat",
      contextSources: ["weather", "market-prices", "news"],
    },
  },

  // Security configuration
  secrets: {
    // These will be managed securely in Axicov vault
    required: ["GEMINI_API_KEY", "WEATHER_API_KEY", "NEWS_API_KEY"],
    optional: ["FLASK_API_URL"],
  },

  // Monitoring and analytics
  monitoring: {
    enabled: true,
    metrics: [
      "api-usage",
      "latency",
      "error-rates",
      "model-performance",
      "cost-tracking",
    ],
  },

  // Deployment configuration
  deployment: {
    environment: process.env.NODE_ENV || "development",
    region: "us-east-1",
    scaling: {
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 70,
    },
  },
};
