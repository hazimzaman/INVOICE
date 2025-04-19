'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiEye, FiMail, FiDownload } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeInvoice } from '@/store/slices/invoicesSlice';

interface InvoicesTableProps {
  onAddClick: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export default function InvoicesTable({ onAddClick, onViewInvoice, onEditInvoice }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(state => state.invoices.invoices);

  const handleDelete = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
  };

  const confirmDelete = () => {
    if (deletingInvoice) {
      dispatch(removeInvoice(deletingInvoice.id));
      setDeletingInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-full max-w-[1240px] mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add Invoice Button */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="text-lg" />
              Add Invoice
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-600">INVOICE #</th>
                <th className="text-left p-4 font-semibold text-gray-600">CLIENT</th>
                <th className="text-left p-4 font-semibold text-gray-600">ITEMS</th>
                <th className="text-left p-4 font-semibold text-gray-600">DATE</th>
                <th className="text-right p-4 font-semibold text-gray-600">TOTAL</th>
                <th className="text-right p-4 font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No matching invoices found.' : 'No invoices found. Create your first invoice to get started.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-800">{invoice.invoiceNumber}</td>
                    <td className="p-4 text-gray-800">{invoice.client.name}</td>
                    <td className="p-4 text-gray-600">{invoice.items.length} items</td>
                    <td className="p-4 text-gray-600">{invoice.date}</td>
                    <td className="p-4 text-gray-800 text-right">
                      {invoice.client.currency}{invoice.total.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => onViewInvoice(invoice)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FiEye className="text-lg" />
                        </button>
                        <button 
                          onClick={() => onEditInvoice(invoice)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice)}
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

      {/* Delete Confirmation Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete invoice #{deletingInvoice.invoiceNumber}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingInvoice(null)}
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
    </>
  );
} 