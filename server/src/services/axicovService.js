/**
 * Axicov Service Integration
 * 
 * This service handles all Axicov workflow interactions,
 * providing a clean abstraction layer for AI operations.
 * 
 * Benefits:
 * - Centralized AI workflow management
 * - Secure API key management via Axicov vault
 * - Real-time monitoring and analytics
 * - Automatic scaling and error handling
 * - Cost tracking and optimization
 */

import axios from 'axios';

// Axicov API base URL (update with your Axicov instance URL)
const AXICOV_API_BASE = process.env.AXICOV_API_BASE || 'https://api.axicov.com/v1';
const AXICOV_API_KEY = process.env.AXICOV_API_KEY; // Managed by Axicov

/**
 * Call Axicov workflow for text chat
 */
export async function chatWithAxicov(message, context = {}) {
  try {
    const response = await axios.post(
      `${AXICOV_API_BASE}/workflows/chat-text/execute`,
      {
        input: {
          message,
          context: {
            platform: 'GreenGrow',
            role: 'farming-advisor',
            ...context
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AXICOV_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      response: response.data.output?.response || response.data.response,
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('Axicov chat error:', error.response?.data || error.message);
    
    // Fallback to direct Gemini API if Axicov fails (for gradual migration)
    if (process.env.USE_AXICOV_FALLBACK !== 'false') {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: true
      };
    }
    
    throw error;
  }
}

/**
 * Execute image analysis workflow (disease detection + Gemini vision)
 */
export async function analyzeImageWithAxicov(imageData, imageMimeType, diseaseResult = null) {
  try {
    const response = await axios.post(
      `${AXICOV_API_BASE}/workflows/image-analysis/execute`,
      {
        input: {
          image: {
            data: imageData,
            mimeType: imageMimeType
          },
          diseaseDetection: diseaseResult,
          context: {
            platform: 'GreenGrow',
            analysisType: 'comprehensive'
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AXICOV_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      response: response.data.output?.analysis || response.data.response,
      diseaseDetection: response.data.output?.diseaseDetection || diseaseResult,
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('Axicov image analysis error:', error.response?.data || error.message);
    
    if (process.env.USE_AXICOV_FALLBACK !== 'false') {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: true
      };
    }
    
    throw error;
  }
}

/**
 * Process voice command through Axicov
 */
export async function processVoiceCommandWithAxicov(command) {
  try {
    const response = await axios.post(
      `${AXICOV_API_BASE}/workflows/voice-command/execute`,
      {
        input: {
          command,
          context: {
            platform: 'GreenGrow',
            assistantName: 'Arav',
            availableActions: ['navigate', 'search', 'weather', 'market', 'crops', 'chat', 'home', 'help', 'info']
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AXICOV_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      ...response.data.output,
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('Axicov voice command error:', error.response?.data || error.message);
    
    if (process.env.USE_AXICOV_FALLBACK !== 'false') {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: true
      };
    }
    
    throw error;
  }
}

/**
 * Live voice conversation with context (weather, market, news)
 */
export async function liveVoiceWithAxicov(message, conversationHistory = [], contextData = {}) {
  try {
    const response = await axios.post(
      `${AXICOV_API_BASE}/workflows/live-voice/execute`,
      {
        input: {
          message,
          conversationHistory,
          context: {
            platform: 'GreenGrow',
            assistantName: 'Arav',
            weatherData: contextData.weatherData,
            marketData: contextData.marketData,
            newsData: contextData.newsData,
            ...contextData
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AXICOV_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      response: response.data.output?.response || response.data.response,
      weatherData: response.data.output?.weatherData,
      marketData: response.data.output?.marketData,
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('Axicov live voice error:', error.response?.data || error.message);
    
    if (process.env.USE_AXICOV_FALLBACK !== 'false') {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: true
      };
    }
    
    throw error;
  }
}

/**
 * Get workflow analytics and metrics
 */
export async function getAxicovMetrics(workflowName = null, timeRange = '24h') {
  try {
    const url = workflowName 
      ? `${AXICOV_API_BASE}/analytics/workflows/${workflowName}?range=${timeRange}`
      : `${AXICOV_API_BASE}/analytics?range=${timeRange}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${AXICOV_API_KEY}`
      }
    });

    return {
      success: true,
      metrics: response.data.metrics || {},
      usage: response.data.usage || {},
      costs: response.data.costs || {}
    };
  } catch (error) {
    console.error('Axicov metrics error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * Health check for Axicov service
 */
export async function checkAxicovHealth() {
  try {
    const response = await axios.get(`${AXICOV_API_BASE}/health`, {
      headers: {
        'Authorization': `Bearer ${AXICOV_API_KEY}`
      },
      timeout: 5000
    });

    return {
      success: true,
      status: response.data.status || 'healthy',
      workflows: response.data.workflows || []
    };
  } catch (error) {
    return {
      success: false,
      status: 'unavailable',
      error: error.message
    };
  }
}

export default {
  chatWithAxicov,
  analyzeImageWithAxicov,
  processVoiceCommandWithAxicov,
  liveVoiceWithAxicov,
  getAxicovMetrics,
  checkAxicovHealth
};

