import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBug, getAllEmployees } from '../services/bugService';
import { getAiSuggestion } from '../services/aiService';
import { toast } from 'react-hot-toast';
import { Bot, Loader2, Sparkles, Lightbulb } from 'lucide-react';

const initial = {
  title: '',
  description: '',
  status: 'OPEN',
  priority: 'MEDIUM',
  assignedTo: '',
};

export default function CreateBug() {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [userType, setUserType] = useState('business');
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load employees on component mount
    getAllEmployees()
      .then((res) => {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Failed to load employees:', err);
      });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    return '';
  };

  const handleAiSuggestion = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in Title and Description first');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);

    try {
      const suggestion = await getAiSuggestion(form.title, form.description, userType);
      setAiSuggestion(suggestion);
      // Update form with AI-suggested priority
      setForm((prev) => ({
        ...prev,
        priority: suggestion.predictedPriority,
      }));
      toast.success('AI suggestion generated! Review and fix the issue before creating the bug.');
    } catch (error) {
      const errorMessage = error.message || 'Failed to get AI suggestion';
      setAiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };


  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setSubmitting(true);
      await createBug(form);
      toast.success('Bug created');
      navigate('/');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to create bug';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Bug</h2>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bug title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bug description"
          />
        </div>

        {/* AI Suggestion Section */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
          <div className="flex items-center">
            <Bot className="text-purple-600 w-5 h-5 mr-2" />
            <h4 className="text-md font-semibold text-purple-800">AI Assistant</h4>
          </div>
          <p className="text-sm text-purple-700">
            Get AI-powered suggestions to help identify and fix the issue before creating the bug report.
          </p>
          
          <div>
            <label htmlFor="userType" className="block text-xs font-medium text-gray-700 mb-1.5">
              Analysis Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setAiSuggestion(null); // Clear previous suggestion when type changes
              }}
              disabled={aiLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="business">Business (Non-Technical)</option>
              <option value="developer">Developer (Technical)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {userType === 'business' 
                ? 'Business-focused analysis with impact assessment and technical notes'
                : 'Technical analysis with code hints and fix suggestions'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleAiSuggestion}
            disabled={aiLoading || !form.title.trim() || !form.description.trim()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestion
              </>
            )}
          </button>
          
          {aiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium mb-1">Error</p>
              <p className="text-xs text-red-600">{aiError}</p>
            </div>
          )}

          {aiSuggestion && (
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Lightbulb className="text-purple-600 w-5 h-5 mr-2" />
                <h4 className="text-sm font-semibold text-purple-800">AI Suggestions</h4>
              </div>
              <div className="bg-white rounded-md p-3 border border-purple-100 space-y-3">
                {/* Check for Business Impact format (business mode) */}
                {aiSuggestion.suggestion.match(/Business Impact:/i) ? (
                  <>
                    {aiSuggestion.suggestion.match(/Business Impact:([^]*?)(?=Possible Causes:|Resolutions:|$)/i) && (
                      <div>
                        <h5 className="text-xs font-semibold text-green-700 mb-1.5 uppercase tracking-wide">Business Impact</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.suggestion.match(/Business Impact:([^]*?)(?=Possible Causes:|Resolutions:|$)/i)?.[1]?.trim()}
                        </p>
                      </div>
                    )}
                    {aiSuggestion.suggestion.match(/Possible Causes:([^]*?)(?=Resolutions:|$)/i) && (
                      <div className="pt-2 border-t border-purple-100">
                        <h5 className="text-xs font-semibold text-purple-700 mb-1.5 uppercase tracking-wide">Possible Causes</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.suggestion.match(/Possible Causes:([^]*?)(?=Resolutions:|$)/i)?.[1]?.trim()}
                        </p>
                      </div>
                    )}
                    {aiSuggestion.suggestion.match(/Resolutions:([^]*?)$/i) && (
                      <div className="pt-2 border-t border-purple-100">
                        <h5 className="text-xs font-semibold text-blue-700 mb-1.5 uppercase tracking-wide">Resolutions</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.suggestion.match(/Resolutions:([^]*?)$/i)?.[1]?.trim()}
                        </p>
                      </div>
                    )}
                  </>
                ) : aiSuggestion.suggestion.split(/Possible Causes:|Resolutions:/i).length > 1 ? (
                  /* Developer mode format */
                  <>
                    {aiSuggestion.suggestion.match(/Possible Causes:([^]*?)(?=Resolutions:|$)/i) && (
                      <div>
                        <h5 className="text-xs font-semibold text-purple-700 mb-1.5 uppercase tracking-wide">Possible Causes</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.suggestion.match(/Possible Causes:([^]*?)(?=Resolutions:|$)/i)?.[1]?.trim()}
                        </p>
                      </div>
                    )}
                    {aiSuggestion.suggestion.match(/Resolutions:([^]*?)$/i) && (
                      <div className="pt-2 border-t border-purple-100">
                        <h5 className="text-xs font-semibold text-blue-700 mb-1.5 uppercase tracking-wide">Resolutions</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.suggestion.match(/Resolutions:([^]*?)$/i)?.[1]?.trim()}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback: plain text */
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {aiSuggestion.suggestion}
                  </p>
                )}
              </div>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Review the suggestions above and fix the issue if possible. If resolved, you may not need to create this bug. Otherwise, proceed to create the bug report.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option>OPEN</option>
              <option>IN_PROGRESS</option>
              <option>RESOLVED</option>
              <option>CLOSED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {employees
                .filter((emp) => emp.availabilityStatus === 'AVAILABLE')
                .map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Bug'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}


