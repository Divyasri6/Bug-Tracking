import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl font-bold">🐛</div>
            <Link to="/" className="text-2xl font-semibold text-gray-900 ml-3 hover:text-blue-600 transition-colors">
              AI Bug Tracker
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/" className={linkClass} end>
              All Bugs
            </NavLink>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              <span className="mr-1.5">+</span>
              New Bug
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


