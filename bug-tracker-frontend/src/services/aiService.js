const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || '/ai';

const normalizeBaseUrl = (url) => url.replace(/\/$/, '');

const extractErrorMessage = async (response) => {
  try {
    const json = await response.clone().json();
    if (typeof json === 'string') {
      return json;
    }
    return json.detail || json.message || json.error || null;
  } catch {
    // ignore JSON parsing errors
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
};

/**
 * Get AI suggestion for a bug.
 * @param {string} title
 * @param {string} description
 * @param {string} userType
 */
export const getAiSuggestion = async (title, description, userType = 'developer') => {
  try {
    const base = normalizeBaseUrl(AI_BASE_URL);
    const response = await fetch(`${base}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, userType }),
    });

    if (!response.ok) {
      const parsedMessage = await extractErrorMessage(response);
      const errorMessage = parsedMessage || 'Failed to get AI suggestion';

      if (response.status === 503 || response.status === 0) {
        throw new Error('AI service is unavailable. Please verify the AI endpoint is reachable.');
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data?.suggestion || !data?.predictedPriority) {
      throw new Error('Invalid response from AI service');
    }

    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to AI service. Please verify the AI endpoint is reachable.');
    }
    throw error;
  }
};

