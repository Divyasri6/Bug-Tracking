import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBugById } from '../services/bugService';
import { toast } from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export default function ViewBug() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getBugById(id)
      .then((res) => mounted && setBug(res.data))
      .catch(() => toast.error('Failed to load bug'))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

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
        <div className="space-y-6">
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
      </main>
    </div>
  );
}


