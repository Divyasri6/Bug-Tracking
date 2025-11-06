import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBugById } from '../services/bugService';
import { getAiSuggestion } from '../services/aiService';
import { toast } from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export default function ViewBug() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getBugById(id)
      .then((res) => mounted && setBug(res.data))
      .catch(() => toast.error('Failed to load bug'))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

  const handleGetAiSuggestion = async () => {
    if (!bug || !bug.title || !bug.description) {
      toast.error('Bug title and description are required for AI analysis');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);

    try {
      const suggestion = await getAiSuggestion(bug.title, bug.description);
      setAiSuggestion(suggestion);
      toast.success('AI suggestion generated');
    } catch (error) {
      const errorMessage = error.message || 'Failed to get AI suggestion. Make sure the AI service is running on port 5001.';
      setAiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading bug details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (!bug) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Bug Not Found</h3>
            <p className="text-red-700 mb-4">The bug you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Two-column layout: Main content + Space for AI panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bug #{bug.id}</h2>
              <div className="flex gap-3">
                <Link
                  to={`/edit/${bug.id}`}
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-5">
              <div>
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Title</span>
                <div className="mt-2 text-gray-900 font-bold text-xl">{bug.title}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Description</span>
                <div className="mt-2 text-gray-600 whitespace-pre-wrap leading-relaxed">{bug.description}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 block">Status</span>
                  <StatusBadge status={bug.status} />
                </div>
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 block">Priority</span>
                  <PriorityBadge priority={bug.priority} />
                </div>
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 block">Assigned To</span>
                  <div className="mt-1 text-gray-600">{bug.assignedTo || <span className="text-gray-400">Not assigned</span>}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 block">Created Date</span>
                  <div className="mt-1 text-sm text-gray-500">
                    {bug.createdDate ? new Date(bug.createdDate).toLocaleString() : '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 block">Updated Date</span>
                  <div className="mt-1 text-sm text-gray-500">
                    {bug.updatedDate ? new Date(bug.updatedDate).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Panel - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-purple-200 p-6">
              <div className="flex items-center mb-4">
                <div className="text-purple-600 text-2xl mr-2">🤖</div>
                <h3 className="text-lg font-semibold text-purple-800">AI Assistant</h3>
              </div>
              
              <p className="text-sm text-purple-700 mb-4">
                Get AI-powered suggestions for possible causes and resolutions for this bug.
              </p>

              <button
                type="button"
                onClick={handleGetAiSuggestion}
                disabled={aiLoading || !bug}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Get AI Suggestion
                  </>
                )}
              </button>

              {aiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 font-medium mb-1">Error</p>
                  <p className="text-xs text-red-600">{aiError}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Make sure the AI service is running on port 5001
                  </p>
                </div>
              )}

              {aiSuggestion && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-purple-600 text-lg mr-2">💡</span>
                      <h4 className="text-sm font-semibold text-purple-800">Possible Causes & Resolutions</h4>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-purple-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {aiSuggestion.suggestion}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-blue-800">AI Predicted Priority</h4>
                      <PriorityBadge priority={aiSuggestion.predictedPriority} />
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Based on the bug description, AI suggests this priority level
                    </p>
                  </div>
                </div>
              )}

              {!aiSuggestion && !aiError && !aiLoading && (
                <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">
                    Click "Get AI Suggestion" to receive
                  </p>
                  <p className="text-xs text-gray-500">
                    AI-powered analysis of possible causes and resolutions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


