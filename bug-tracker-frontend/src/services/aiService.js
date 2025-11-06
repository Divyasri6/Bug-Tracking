const AI_BASE_URL = 'http://localhost:5001';

/**
 * Get AI suggestion for a bug
 * Sends POST request to /ai/suggest endpoint
 * @param {string} title - Bug title
 * @param {string} description - Bug description
 * @param {string} userType - User type: "developer" or "business" (default: "developer")
 * @returns {Promise<{suggestion: string, predictedPriority: string}>} AI suggestion with predicted priority
 * @throws {Error} If the request fails or service is unavailable
 */
export const getAiSuggestion = async (title, description, userType = 'developer') => {
  try {
    const response = await fetch(`${AI_BASE_URL}/ai/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, userType }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get AI suggestion';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      
      if (response.status === 503 || response.status === 0) {
        throw new Error('AI service is unavailable. Make sure it\'s running on port 5001.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.suggestion || !data.predictedPriority) {
      throw new Error('Invalid response from AI service');
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to AI service. Make sure it\'s running on http://localhost:5001');
    }
    throw error;
  }
};

