import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllBugs, deleteBug } from '../services/bugService';
import { toast } from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

function BugList() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    getAllBugs()
      .then((res) => {
        if (!isMounted) return;
        setBugs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err?.response?.data?.message || err.message || 'Failed to load bugs.';
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side filtering
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      // Search filter (title or status)
      const matchesSearch =
        searchTerm === '' ||
        bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.status.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || bug.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'ALL' || bug.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [bugs, searchTerm, statusFilter, priorityFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading bugs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Oops!</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bug Dashboard</h1>
          <p className="text-gray-600">Manage and track all your bugs</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Priority
              </label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{filteredBugs.length}</span> of{' '}
          <span className="font-medium text-gray-700">{bugs.length}</span> bug{bugs.length !== 1 ? 's' : ''}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-gray-500 text-center" colSpan={8}>
                    {bugs.length === 0
                      ? 'No bugs found.'
                      : 'No bugs match your filters. Try adjusting your search or filters.'}
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug, index) => (
                  <tr
                    key={bug.id}
                    className={`transition-all duration-200 ease-in-out ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 cursor-pointer`}
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">{bug.id}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{bug.title}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xl truncate" title={bug.description}>
                      {bug.description}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bug.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={bug.priority} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{bug.assignedTo || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {bug.createdDate ? new Date(bug.createdDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/bugs/${bug.id}`}
                          className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-center text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                        >
                          View
                        </Link>
                        <Link
                          to={`/edit/${bug.id}`}
                          className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg border border-transparent hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-center text-red-600 bg-white rounded-lg border border-red-300 hover:bg-red-50 focus:ring-4 focus:ring-red-100 transition-all duration-200"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this bug?')) {
                              try {
                                await deleteBug(bug.id);
                                toast.success('Bug deleted');
                                setBugs((list) => list.filter((b) => b.id !== bug.id));
                              } catch {
                                toast.error('Failed to delete bug');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default BugList;


