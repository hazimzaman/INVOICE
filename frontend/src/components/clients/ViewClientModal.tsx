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
    <div className="fixed inset-0 shadow-md  backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{client.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Company Details</h3>
            <p className="text-gray-600">{client.company || 'N/A'}</p>
            <p className="text-gray-600">Currency: {client.currency || '$'}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">Contact Information</h3>
            <p className="flex items-center gap-2">
              <span className="text-gray-600">📧</span>
              <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                {client.email}
              </a>
            </p>
            {client.phone && (
              <p className="flex items-center gap-2">
                <span className="text-gray-600">📞</span>
                <span>{client.phone}</span>
              </p>
            )}
            {client.address && (
              <p className="flex items-center gap-2">
                <span className="text-gray-600">📍</span>
                <span>{client.address}</span>
              </p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>Created: {formatDate(client.created_at)}</p>
            <p>Last Updated: {formatDate(client.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClientModal; 