'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import ClientsTable from '@/components/clients/ClientsTable';
import AddClientModal from '@/components/clients/AddClientModal';
import EditClientModal from '@/components/clients/EditClientModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addClient, updateClient, deleteClient, fetchClients } from '@/store/slices/clientsSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function ClientsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { clients, loading, error } = useAppSelector((state) => state.clients);

  useEffect(() => {
    if (user) {
      dispatch(fetchClients(user.id));
    }
  }, [dispatch, user]);

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      await dispatch(addClient({
        userId: user.id,
        client: clientData
      })).unwrap();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleUpdateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      await dispatch(updateClient({ clientId, updates })).unwrap();
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await dispatch(deleteClient(clientId)).unwrap();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Client
        </button>
      </div>

      <ClientsTable 
        clients={clients}
        onEdit={(client) => {
          setSelectedClient(client);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteClient}
      />

      <AddClientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClient}
      />

      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onSubmit={(updates) => handleUpdateClient(selectedClient.id, updates)}
        />
      )}
    </div>
  );
} 