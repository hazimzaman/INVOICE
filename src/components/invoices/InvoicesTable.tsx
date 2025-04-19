import React, { useState } from 'react';
import { FiEye, FiEdit2, FiDownload, FiMail, FiTrash2 } from 'react-icons/fi';

interface Invoice {
  id: string;
  // Add any other necessary properties here
}

interface InvoicesTableProps {
  onAddClick: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onEmailInvoice: (invoice: Invoice) => void;
}

export default function InvoicesTable({ 
  onAddClick, 
  onViewInvoice, 
  onEditInvoice,
  onDownloadInvoice,
  onEmailInvoice 
}: InvoicesTableProps) {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  return (
    <>
      {/* ... existing table code ... */}
      <tbody>
        {filteredInvoices.map((invoice) => (
          <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
            {/* ... other columns ... */}
            <td className="p-4">
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => onViewInvoice(invoice)}
                  className="text-gray-600 hover:text-blue-600"
                  title="View"
                >
                  <FiEye className="text-lg" />
                </button>
                <button 
                  onClick={() => onEditInvoice(invoice)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Edit"
                >
                  <FiEdit2 className="text-lg" />
                </button>
                <button 
                  onClick={() => onDownloadInvoice(invoice)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Download"
                >
                  <FiDownload className="text-lg" />
                </button>
                <button 
                  onClick={() => onEmailInvoice(invoice)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Email"
                >
                  <FiMail className="text-lg" />
                </button>
                <button 
                  onClick={() => handleDelete(invoice)}
                  className="text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      {/* ... rest of the code ... */}
    </>
  );
} 