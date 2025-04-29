'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiEye, FiMoreVertical } from 'react-icons/fi';
import { Client } from '@/types/client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteClient, updateClient, fetchClients } from '@/store/slices/clientsSlice';
import EditClientModal from './EditClientModal';
import ViewClientModal from './ViewClientModal';
import { useAuth } from '@/contexts/AuthContext';

interface ClientsTableProps {
  onAddClick: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientsTable({ onAddClick, onEdit, onDelete }: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user } = useAuth();
  const { clients, loading, error } = useAppSelector(state => state.clients);
  const dispatch = useAppDispatch();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  const toggleDropdown = (clientId: string) => {
    setOpenDropdownId(openDropdownId === clientId ? null : clientId);
  };

  return (
    <>
      <div className="w-full max-w-[1240px] mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 items-center mb-8 sm:flex-row sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Search */}
            <div className="relative w-full">
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
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              <FiPlus className="text-lg" />
              Add Client
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 font-semibold text-gray-600 sm:text-sm">NAME</th>
                <th className="text-left p-2 font-semibold text-gray-600">COMPANY</th>
                <th className="text-left p-2 font-semibold text-gray-600">CURRENCY</th>
                <th className="text-left p-2 font-semibold text-gray-600">CREATED</th>
                <th className="text-right p-2 font-semibold text-gray-600">ACTIONS</th>
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
                    <td className="p-4 text-gray-600">
                      {new Date(client.created_at!).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => {
                            setSelectedClient(client);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FiEye className="text-xl" />
                        </button>
                        <button
                          onClick={() => setEditingClient(client)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Edit"
                        >
                          <FiEdit2 className="text-xl" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No matching clients found.' : 'No clients found. Add your first client to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white rounded-lg shadow p-4 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{client.name}</p>
                      <p className="text-gray-600">{client.company || '-'}</p>
                    </div>
                    
                    {/* Three dots menu */}
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(client.id)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {openDropdownId === client.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30"
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-40 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsViewModalOpen(true);
                                  toggleDropdown(client.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <FiEye className="mr-3 w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setEditingClient(client);
                                  toggleDropdown(client.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <FiEdit2 className="mr-3 w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingClient(client);
                                  toggleDropdown(client.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                              >
                                <FiTrash2 className="mr-3 w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <span className="text-gray-500">Currency:</span>
                      <span className="font-medium">{client.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(client.created_at!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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