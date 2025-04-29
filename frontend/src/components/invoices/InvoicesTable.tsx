import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInvoices, deleteInvoice } from '@/store/slices/invoicesSlice';
import { FiEye, FiEdit2, FiTrash2, FiMail, FiCalendar, FiChevronDown, FiDownload, FiFilter, FiArrowUp, FiArrowDown, FiClock, FiDollarSign, FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import ViewInvoiceModal from './ViewInvoiceModal';
import EditInvoiceModal from './EditInvoiceModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { generatePDF } from '@/utils/generatePDF';
import { sendEmail } from '@/utils/email';
import { formatDate } from '@/utils/dateFormat';
import { Settings } from '@/types/settings';

interface InvoicesTableProps {
  searchQuery: string;
  filterType: FilterType;
  statusFilter: string;
}

type SortOrder = 'asc' | 'desc';
type SortField = 'date' | 'amount' | 'status';
type FilterType = 'all' | 'highest_paid' | 'lowest_paid' | 'latest' | 'oldest' | 'status';

export default function InvoicesTable({ searchQuery, filterType, statusFilter }: InvoicesTableProps) {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector((state) => state.invoices);
  const { data: settings } = useAppSelector((state) => state.settings);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

  const defaultSettings: Settings = {
    business_name: '',
    business_logo: '',
    business_address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    wise_email: '',
    invoice_prefix: '',
    footer_note: '',
    current_invoice_number: 0,
    email_template: '',
    email_subject: '',
    email_signature: '',
    cc_email: '',
    bcc_email: ''
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invoiceId);

      if (error) throw error;

      dispatch(fetchInvoices());
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setOpenDropdownId(null);
    }
  };

  const handleDateUpdate = async (invoiceId: string, newDate: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          date: newDate, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invoiceId);

      if (error) throw error;

      dispatch(fetchInvoices());
      toast.success('Date updated');
    } catch (error) {
      toast.error('Failed to update date');
    } finally {
      setOpenDropdownId(null);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const pdfBlob = await generatePDF(invoice, settings || defaultSettings);
      
      // Create download link with client name
      const fileName = `invoice-${invoice.invoice_number} ${invoice.client?.name}.pdf`;
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    setLoadingStates(prev => ({ ...prev, [`send_${invoice.id}`]: true }));
    try {
      if (!invoice.client?.email) {
        throw new Error('Client email is required');
      }

      const pdfBlob = await generatePDF(invoice, settings || defaultSettings);

      // Convert blob to base64
      const pdfBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });

      // Prepare email content
      const emailBody = replaceTemplateVariables(settings?.email_template || '', invoice, settings);
      const emailSubject = replaceTemplateVariables(settings?.email_subject || 'Invoice {{invoice_number}} from {{business_name}}', invoice, settings);

      // Send email with PDF attachment
      await sendEmail({
        to: invoice.client.email,
        subject: emailSubject,
        body: emailBody,
        attachments: [{
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: pdfBase64 as string
        }]
      });

      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invoice');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`send_${invoice.id}`]: false }));
    }
  };

  const replaceTemplateVariables = (template: string, invoice: Invoice, settings: Settings | null) => {
    const replacements = {
      '{{client_name}}': invoice.client?.name || '',
      '{{invoice_number}}': `${invoice.invoice_number} ${invoice.client?.name}`,
      '{{total_amount}}': `${invoice.client?.currency || '€'}${invoice.total.toFixed(2)}`,
      '{{date}}': formatDate(invoice.date),
      '{{payment_details}}': settings?.wise_email || '',
      '{{business_name}}': settings?.business_name || '',
      '{{contact_email}}': settings?.contact_email || ''
    };

    return Object.entries(replacements).reduce((text, [key, value]) => {
      return text.replace(new RegExp(key.replace(/\s+/g, ''), 'g'), value);
    }, template).replace(/\n/g, '<br>');
  };

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const getFilteredAndSortedInvoices = () => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    switch (filterType) {
      case 'highest_paid':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'lowest_paid':
        filtered.sort((a, b) => a.total - b.total);
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'status':
        if (statusFilter !== 'all') {
          filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }
        break;
      default:
        break;
    }

    return filtered;
  };

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
    <div className=" w-full ">


      <table className="min-w-full divide-y divide-gray-200 overflow-visible">
        <thead className="bg-gray-50 overflow-visible">
          <tr className='overflow-visible'>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
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
        <tbody className="bg-white divide-y divide-gray-200 overflow-visible ">
          {getFilteredAndSortedInvoices().map((invoice) => (
            <tr 
              key={invoice.id} 
              className="group relative hover:bg-gray-50 overflow-visible"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.invoice_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.client?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === `date-${invoice.id}` ? null : `date-${invoice.id}`)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  
                  {openDropdownId === `date-${invoice.id}` && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenDropdownId(null)}
                      />
                      <div 
                        className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        style={{ transform: 'translateY(0%)' }}
                      >
                        <input
                          type="date"
                          defaultValue={invoice.date.split('T')[0]}
                          onChange={(e) => handleDateUpdate(invoice.id, e.target.value)}
                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${invoice.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === `status-${invoice.id}` ? null : `status-${invoice.id}`)}
                    className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <span>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                    <FiChevronDown className="w-3 h-3" />
                  </button>
                  
                  {openDropdownId === `status-${invoice.id}` && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenDropdownId(null)}
                      />
                      <div 
                        className="absolute right-[-4] z-50 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        style={{ transform: 'translateY(0%)' }}
                      >
                        <div className="py-1">
                          {['pending', 'paid', 'overdue'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(invoice.id, status)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end">
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsViewModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 mx-2"
                  title="View"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    handleDownloadPDF(invoice);
                  }}
                  className="text-gray-600 hover:text-gray-900 mx-2"
                  title="Download PDF"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    handleSendEmail(invoice);
                  }}
                  disabled={loadingStates[`send_${invoice.id}`]}
                  className={`text-gray-600 hover:text-gray-900 mx-2 ${loadingStates[`send_${invoice.id}`] ? 'animate-spin' : ''}`}
                  title="Send Email"
                >
                  {loadingStates[`send_${invoice.id}`] ? (
                    <FiSend className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiMail className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsEditModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 mx-2"
                  title="Edit"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-red-600 hover:text-red-900 mx-2"
                  title="Delete"
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