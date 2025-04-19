'use client';

import { FiX } from 'react-icons/fi';
import { Invoice, Client } from '@/types/invoice';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

interface Client {
  id: string;
  name: string;
  company: string;
  currency: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  total: number;
}

export default function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-lg w-full max-w-[800px] p-8 shadow-xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
            <p className="text-gray-500 mt-1">Created on {invoice.date}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600 p-2">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Client and Invoice Info */}
          <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Bill To</h3>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">{invoice.client.name}</p>
                <p className="text-gray-600">{invoice.client.company}</p>
                {invoice.client.email && (
                  <p className="text-gray-600">{invoice.client.email}</p>
                )}
                {invoice.client.phone && (
                  <p className="text-gray-600">{invoice.client.phone}</p>
                )}
                {invoice.client.address && (
                  <p className="text-gray-600">{invoice.client.address}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="text-gray-900">{invoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="text-gray-900">{invoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize font-medium ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b">
                <div className="col-span-3 font-medium text-gray-700">Item</div>
                <div className="col-span-6 font-medium text-gray-700">Description</div>
                <div className="col-span-3 font-medium text-gray-700 text-right">Price</div>
              </div>
              
              <div className="divide-y">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4">
                    <div className="col-span-3">
                      <p className="text-gray-900">{item.name}</p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-gray-900">{invoice.client.currency}{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end border-t pt-6">
            <div className="w-64">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{invoice.client.currency}{invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-900 font-medium">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {invoice.client.currency}{invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 