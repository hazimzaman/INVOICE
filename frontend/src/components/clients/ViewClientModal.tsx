import { FiX, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Client } from '@/types/client';

interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export default function ViewClientModal({ isOpen, onClose, client }: ViewClientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-[600px] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Company Details</h3>
            <p className="text-gray-600">{client.company}</p>
            <p className="text-gray-500 text-sm mt-1">Currency: {client.currency}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail className="text-gray-400" />
              <p>{client.email}</p>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="text-gray-400" />
                <p>{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiMapPin className="text-gray-400" />
                <p>{client.address}</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>Created: {new Date(client.created || '').toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 