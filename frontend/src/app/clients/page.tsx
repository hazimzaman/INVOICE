'use client';

import { useState } from 'react';
import ClientsTable from '@/components/clients/ClientsTable';
import AddClientModal from '@/components/clients/AddClientModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Page() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <ProtectedRoute>
     <section className='container mx-auto px-4 pt-25 pb-20'>
     <ClientsTable 
        onAddClick={() => setIsAddModalOpen(true)} 
      />
      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      />
     </section>
    </ProtectedRoute>
  );
} 