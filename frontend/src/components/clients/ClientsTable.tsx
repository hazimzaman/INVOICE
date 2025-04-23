'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiEye } from 'react-icons/fi';
import { Client } from '@/types/client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteClient, updateClient, fetchClients } from '@/store/slices/clientsSlice';
import EditClientModal from './EditClientModal';
import ViewClientModal from './ViewClientModal';
import { useAuth } from '@/contexts/AuthContext';

interface ClientsTableProps {
  onAddClick: () => void;
}

export default function ClientsTable({ onAddClick }: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user } = useAuth();
  const { clients, loading, error } = useAppSelector(state => state.clients);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadClients = async () => {
      if (user) {
        try {
          await dispatch(fetchClients()).unwrap();
        } catch (error) {
          console.error('Failed to fetch clients:', error);
        }
      }
    };
    loadClients();
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteClient(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const confirmDelete = () => {
    if (deletingClient) {
      handleDelete(deletingClient.id);
      setDeletingClient(null);
    }
  };

  const handleEdit = async (clientId: string, updates: Partial<Client>) => {
    try {
      await dispatch(updateClient({ clientId, updates })).unwrap();
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-full max-w-[1240px] mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add Client Button */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="text-lg" />
              Add Client
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-600">NAME</th>
                <th className="text-left p-4 font-semibold text-gray-600">COMPANY</th>
                <th className="text-left p-4 font-semibold text-gray-600">CURRENCY</th>
                <th className="text-left p-4 font-semibold text-gray-600">CREATED</th>
                <th className="text-right p-4 font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No matching clients found.' : 'No clients found. Add your first client to get started.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-800">{client.name}</td>
                    <td className="p-4 text-gray-800">{client.company || '-'}</td>
                    <td className="p-4 text-gray-600">{client.currency}</td>
                    <td className="p-4 text-gray-600">{new Date(client.created_at!).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => {
                            setSelectedClient(client);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <FiEye className="text-xl" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingClient(client);
                          }}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingClient(client);
                          }}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSave={(updatedClient) => handleEdit(updatedClient.id, updatedClient)}
          client={editingClient}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete client "{deletingClient.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <ViewClientModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />
      )}
    </>
  );
} 