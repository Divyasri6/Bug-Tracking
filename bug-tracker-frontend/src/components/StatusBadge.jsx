/**
 * Gets the color class for priority levels
 * @param {string} priority 
 * @returns {string} Tailwind CSS classes
 */
export const getPriorityClass = (priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'CRITICAL':
      return 'bg-red-200 text-red-900 border-red-400';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Gets the color class for status levels
 * @param {string} status 
 * @returns {string} Tailwind CSS classes
 */
export const getStatusClass = (status) => {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'IN_PROGRESS':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'RESOLVED':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    case 'CLOSED':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export function StatusBadge({ status }) {
  const style = getStatusClass(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style} transition-all duration-200`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = getPriorityClass(priority);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style} transition-all duration-200`}
    >
      {priority}
    </span>
  );
}

