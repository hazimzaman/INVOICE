'use client';

import { useState } from 'react';
import ClientsTable from '@/components/clients/ClientsTable';
import AddClientModal from '@/components/clients/AddClientModal';
import { Client } from '@/types/client';
import { useAppDispatch } from '@/store/hooks';
import { addClient } from '@/store/slices/clientsSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Page() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleAddClient = (clientData: Omit<Client, 'id' | 'created'>) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      created: new Date().toISOString().split('T')[0],
      ...clientData
    };

    dispatch(addClient(newClient));
    setIsAddModalOpen(false);
  };

  return (
    <ProtectedRoute>
     <section className='container mx-auto px-4 pt-25 pb-20'>
     <ClientsTable 
        onAddClick={() => setIsAddModalOpen(true)} 
      />
      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />
     </section>
    </ProtectedRoute>
  );
} 