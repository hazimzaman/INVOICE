import { FiLogOut } from 'react-icons/fi';

export default function LogoutButton() {
  return (
    <button 
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 
        transition-colors duration-200 rounded-lg hover:bg-red-50"
    >
      <FiLogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
} 