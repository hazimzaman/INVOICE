'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchInvoices } from '@/store/slices/invoicesSlice';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import InvoicesTable from './InvoicesTable';
import AddInvoiceModal from './AddInvoiceModal';
import { FiPlus, FiSearch } from 'react-icons/fi';

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      dispatch(fetchInvoices());
    };

    checkAuth();
  }, [dispatch, router]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-[1240px] w-full mx-auto ">
        <h1 className="text-2xl font-bold">Invoicesss</h1>
        
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Invoice Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Table */}
      <InvoicesTable searchQuery={searchQuery} />

      {/* Add Invoice Modal */}
      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
} 