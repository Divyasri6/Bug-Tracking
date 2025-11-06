import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBugs } from '../services/bugService';
import { Bug, AlertCircle, User, TrendingUp, ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAllBugs()
      .then((res) => {
        if (!isMounted) return;
        setBugs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Failed to load bugs:', err);
        if (!isMounted) return;
        setBugs([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBugs = bugs.length;
    const openBugs = bugs.filter((bug) => bug.status === 'OPEN').length;
    const highPriorityBugs = bugs.filter(
      (bug) => bug.priority === 'HIGH' || bug.priority === 'CRITICAL'
    ).length;
    const assignedToMe = bugs.filter((bug) => bug.assignedTo && bug.assignedTo.trim() !== '').length;
    
    return { totalBugs, openBugs, highPriorityBugs, assignedToMe };
  }, [bugs]);

  // Handle stat card click - navigate to bug list with filter
  const handleStatClick = (type) => {
    const params = new URLSearchParams();
    switch (type) {
      case 'total':
        // Show all bugs
        navigate('/bugs');
        break;
      case 'open':
        params.set('status', 'OPEN');
        navigate(`/bugs?${params.toString()}`);
        break;
      case 'high':
        params.set('priority', 'HIGH');
        navigate(`/bugs?${params.toString()}`);
        break;
      case 'assigned':
        params.set('assigned', 'true');
        navigate(`/bugs?${params.toString()}`);
        break;
      default:
        navigate('/bugs');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bug Tracker Dashboard</h1>
          <p className="text-gray-600 text-lg">Overview of your bug tracking system</p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bugs */}
          <button
            type="button"
            onClick={() => handleStatClick('total')}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Bug className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalBugs}</h3>
            <p className="text-sm text-gray-600 mb-2">Total Bugs</p>
            <div className="flex items-center text-xs text-blue-600 font-medium group-hover:text-blue-700">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* Open Bugs */}
          <button
            type="button"
            onClick={() => handleStatClick('open')}
            className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 hover:shadow-xl transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                {stats.openBugs > 0 ? 'Active' : 'None'}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.openBugs}</h3>
            <p className="text-sm text-gray-600 mb-2">Open Bugs</p>
            <div className="flex items-center text-xs text-yellow-600 font-medium group-hover:text-yellow-700">
              View open <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* High Priority Bugs */}
          <button
            type="button"
            onClick={() => handleStatClick('high')}
            className="bg-white rounded-xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                {stats.highPriorityBugs > 0 ? 'Urgent' : 'None'}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.highPriorityBugs}</h3>
            <p className="text-sm text-gray-600 mb-2">High Priority</p>
            <div className="flex items-center text-xs text-red-600 font-medium group-hover:text-red-700">
              View urgent <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* Assigned to Me */}
          <button
            type="button"
            onClick={() => handleStatClick('assigned')}
            className="bg-white rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {stats.assignedToMe > 0 ? 'Active' : 'None'}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.assignedToMe}</h3>
            <p className="text-sm text-gray-600 mb-2">Assigned Bugs</p>
            <div className="flex items-center text-xs text-purple-600 font-medium group-hover:text-purple-700">
              View assigned <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/bugs"
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">View All Bugs</h3>
                <p className="text-sm text-gray-600">Browse and manage all bug reports</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Bug className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/create"
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg border border-blue-600 p-6 hover:shadow-xl transition-all duration-200 group text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Create New Bug</h3>
                <p className="text-sm text-blue-100">Report a new bug or issue</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

