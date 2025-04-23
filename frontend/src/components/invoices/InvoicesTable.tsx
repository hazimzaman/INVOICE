import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInvoices, deleteInvoice } from '@/store/slices/invoicesSlice';
import { FiEye, FiEdit2, FiTrash2, FiMail } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import ViewInvoiceModal from '../../components/invoices/ViewInvoiceModal';
import EditInvoiceModal from './EditInvoiceModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';

interface InvoicesTableProps {
  searchQuery: string;
}

export default function InvoicesTable({ searchQuery }: InvoicesTableProps) {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector((state) => state.invoices);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (invoice: Invoice) => {
    try {
      await dispatch(deleteInvoice(invoice.id)).unwrap();
      toast.success('Invoice deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto max-w-[1240px] w-full mx-auto ">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.invoice_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.client?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(invoice.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(invoice.due_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${invoice.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsViewModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 mx-2"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsEditModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 mx-2"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-red-600 hover:text-red-900 mx-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      {selectedInvoice && (
        <>
          <ViewInvoiceModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
          <EditInvoiceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedInvoice(null);
            }}
            onConfirm={() => handleDelete(selectedInvoice)}
            title="Delete Invoice"
            message="Are you sure you want to delete this invoice? This action cannot be undone."
          />
        </>
      )}
    </div>
  );
} 