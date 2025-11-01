/**
 * Axicov Configuration for GreenGrow
 * 
 * This configuration defines how Axicov will manage and deploy
 * the AI workflows for the GreenGrow farming platform.
 */

module.exports = {
  name: "greengrow-ai",
  description: "AI-powered farming assistant platform with disease detection and chat capabilities",
  readmePath: "../Readme.md", // Path to README file
  env: ".env",
  
  params: {
    version: {
      type: String,
      description: "Project version",
      required: true,
      default: "1.0.0"
    },
    author: {
      type: String,
      description: "Project author",
      required: true,
      default: "GreenGrow Team"
    },
    license: {
      type: String,
      description: "Project license",
      required: false,
      default: "MIT"
    },
    projectType: {
      type: String,
      description: "Type of project",
      required: false,
      default: "agriculture"
    },
    aiFeatures: {
      type: String,
      description: "AI features included (comma-separated)",
      required: false,
      default: "disease-detection,chat-assistant,voice-assistant,image-analysis"
    },
    models: {
      type: String,
      description: "AI models used (comma-separated)",
      required: false,
      default: "tensorflow,gemini-2.0-flash-exp"
    }
  },
  
  port: 5000,
  tags: ["agriculture", "farming", "ai", "disease-detection", "gemini", "tensorflow", "nodejs", "flask"]
};
