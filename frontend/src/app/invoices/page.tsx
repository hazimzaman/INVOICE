'use client';

import { useState } from 'react';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import AddInvoiceModal from '@/components/invoices/AddInvoiceModal';
import ViewInvoiceModal from '@/components/invoices/ViewInvoiceModal';
import EditInvoiceModal from '@/components/invoices/EditInvoiceModal';
import { Invoice } from '@/types/invoice';
import { useAppDispatch } from '@/redux/hooks';
import { addInvoice, updateInvoice } from '@/redux/features/invoicesSlice';

export default function InvoicesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const dispatch = useAppDispatch();

  const handleAddInvoice = (invoiceData: Omit<Invoice, 'id' | 'status'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      status: 'pending'
    };

    dispatch(addInvoice(newInvoice));
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewMode(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    dispatch(updateInvoice(updatedInvoice));
    setIsEditMode(false);
    setSelectedInvoice(null);
  };

  return (
    <>
      <InvoicesTable 
        onAddClick={() => setIsAddModalOpen(true)}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEditInvoice}
      />
      <AddInvoiceModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddInvoice={handleAddInvoice}
      />
      {selectedInvoice && isViewMode && (
        <ViewInvoiceModal
          isOpen={isViewMode}
          onClose={() => {
            setIsViewMode(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
        />
      )}
      {selectedInvoice && isEditMode && (
        <EditInvoiceModal
          isOpen={isEditMode}
          onClose={() => {
            setIsEditMode(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onSave={handleUpdateInvoice}
        />
      )}
    </>
  );
} 