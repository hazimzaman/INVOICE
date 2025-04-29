import { FiX, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Client } from '@/types/client';
import { formatDate } from '@/utils/dateFormat';

interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const ViewClientModal: React.FC<ViewClientModalProps> = ({ isOpen, onClose, client }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.12)] max-w-lg w-full transform transition-all">
        <div className="p-6 ">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Company Details</h3>
            <p className="text-gray-700">{client.company || 'N/A'}</p>
            <p className="text-gray-700">Currency: {client.currency || '$'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-3 text-gray-700">
                <FiMail className="w-5 h-5 text-blue-600" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                  {client.email}
                </a>
              </p>
              {client.phone && (
                <p className="flex items-center gap-3 text-gray-700">
                  <FiPhone className="w-5 h-5 text-green-600" />
                  <span>{client.phone}</span>
                </p>
              )}
              {client.address && (
                <p className="flex items-center gap-3 text-gray-700">
                  <FiMapPin className="w-5 h-5 text-red-600" />
                  <span>{client.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Timestamps</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Created: {client.created_at ? formatDate(client.created_at) : 'N/A'}</p>
              <p>Last Updated: {client.updated_at ? formatDate(client.updated_at) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClientModal; 