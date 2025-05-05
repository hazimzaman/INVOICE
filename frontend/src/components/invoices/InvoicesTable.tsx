'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInvoices, deleteInvoice } from '@/store/slices/invoicesSlice';
import { FiEye, FiEdit2, FiTrash2, FiMail, FiCalendar, FiChevronDown, FiDownload, FiFilter, FiArrowUp, FiArrowDown, FiClock, FiDollarSign, FiCheckCircle, FiAlertCircle, FiSend, FiMoreVertical, FiLoader, FiX } from 'react-icons/fi';
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
import DownloadConfirmationModal from './DownloadConfirmationModal';

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
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [isMultiEmailMode, setIsMultiEmailMode] = useState(false);
  const [selectedEmailInvoices, setSelectedEmailInvoices] = useState<string[]>([]);
  const [showMultiEmailModal, setShowMultiEmailModal] = useState(false);
  const [isMultiDownloadMode, setIsMultiDownloadMode] = useState(false);
  const [selectedDownloadInvoices, setSelectedDownloadInvoices] = useState<string[]>([]);
  const [showMultiDownloadModal, setShowMultiDownloadModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

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

  const handleSendEmail = async (invoiceId: string) => {
    setShowEmailModal(false);
    setSendingEmail(invoiceId);
    try {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      if (!invoice.client?.email) throw new Error('Client email is required');

      const pdfBlob = await generatePDF(invoice, settings || defaultSettings);
      
      // Convert PDF to base64
      const pdfBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });

      // Prepare email content
      const emailBody = replaceTemplateVariables(settings?.email_template || '', invoice, settings);
      const emailSubject = replaceTemplateVariables(settings?.email_subject || 'Invoice {{invoice_number}} from {{business_name}}', invoice, settings);

      // Send email with proper format
      await sendEmail({
        to: invoice.client.email,
        subject: emailSubject,
        body: emailBody,
        attachments: [{
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: pdfBase64 as string
        }]
      });

      toast.success('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSendingEmail(null);
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

  const toggleDropdown = (invoiceId: string) => {
    setOpenDropdownId(openDropdownId === invoiceId ? null : invoiceId);
  };

  const handleMultiDelete = async () => {
    setShowMultiDeleteModal(false);
    try {
      await Promise.all(selectedInvoices.map(id => dispatch(deleteInvoice(id)).unwrap()));
      toast.success('Invoices deleted successfully');
      setSelectedInvoices([]);
      setIsMultiDeleteMode(false);
    } catch (error) {
      toast.error('Failed to delete some invoices');
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleMultiSendEmail = async () => {
    setShowMultiEmailModal(false);
    try {
      for (const id of selectedEmailInvoices) {
        const invoice = invoices.find(i => i.id === id);
        if (!invoice) continue;
        setLoadingStates(prev => ({ ...prev, [`send_${id}`]: true }));
        await handleSendEmail(id);
      }
      setSelectedEmailInvoices([]);
      setIsMultiEmailMode(false);
      toast.success('Emails sent successfully');
    } catch (error) {
      toast.error('Failed to send some emails');
    }
  };

  const handleMultiDownload = async () => {
    setShowMultiDownloadModal(false);
    try {
      for (const id of selectedDownloadInvoices) {
        const invoice = invoices.find(i => i.id === id);
        if (!invoice) continue;
        setLoadingStates(prev => ({ ...prev, [`download_${id}`]: true }));
        await handleDownloadPDF(invoice);
        setLoadingStates(prev => ({ ...prev, [`download_${id}`]: false }));
      }
      setSelectedDownloadInvoices([]);
      setIsMultiDownloadMode(false);
      toast.success('All PDFs downloaded successfully');
    } catch (error) {
      toast.error('Failed to download some PDFs');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <>
      {/* Desktop Table - Hide on small screens */}
      <div className="hidden sm:block ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className='overflow-visible'>
              {isMultiDeleteMode && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
              )}
              {isMultiEmailMode && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
              )}
              {isMultiDownloadMode && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell  ">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell ">
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
          <tbody className="bg-white divide-y divide-gray-200 overflow-visible">
            {getFilteredAndSortedInvoices().map((invoice) => (
              <tr key={invoice.id} className="group relative hover:bg-gray-50 overflow-visible">
                {isMultiDeleteMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => toggleInvoiceSelection(invoice.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                )}
                {isMultiEmailMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmailInvoices.includes(invoice.id)}
                      onChange={() => {
                        setSelectedEmailInvoices(prev => 
                          prev.includes(invoice.id) 
                            ? prev.filter(id => id !== invoice.id)
                            : [...prev, invoice.id]
                        );
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                )}
                {isMultiDownloadMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDownloadInvoices.includes(invoice.id)}
                      onChange={() => {
                        setSelectedDownloadInvoices(prev => 
                          prev.includes(invoice.id) 
                            ? prev.filter(id => id !== invoice.id)
                            : [...prev, invoice.id]
                        );
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.client?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell  ">
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
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  ${invoice.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Show all actions on large screens */}
                  <div className="hidden lg:flex items-center justify-end">
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
                        setIsDownloadModalOpen(true);
                      }}
                      className="flex items-center  px-1 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiDownload className="w-4 h-4 mr-2" />
                      
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setShowEmailModal(true);
                      }}
                      className="flex items-center  px-1 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {sendingEmail === invoice.id ? (
                        <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FiMail className="w-4 h-4 mr-2" />
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
                  </div>

                  {/* Show three dots menu on smaller screens */}
                  <div className="lg:hidden relative">
                    <button 
                      onClick={() => toggleDropdown(invoice.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Dropdown menu */}
                    {openDropdownId === invoice.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-40 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewModalOpen(true);
                                toggleDropdown(invoice.id);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                            >
                              <FiEye className="mr-3 w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsDownloadModalOpen(true);
                                toggleDropdown(invoice.id);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FiDownload className="mr-3 w-4 h-4" />
                             
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoiceId(invoice.id);
                                setShowEmailModal(true);
                                toggleDropdown(invoice.id);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 "
                            >
                              {sendingEmail === invoice.id ? (
                                <FiLoader className="mr-3 w-4 h-4 animate-spin" />
                              ) : (
                                <FiMail className="mr-3 w-4 h-4" />
                              )}
                              S
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsEditModalOpen(true);
                                toggleDropdown(invoice.id);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                            >
                              <FiEdit2 className="mr-3 w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsDeleteModalOpen(true);
                                toggleDropdown(invoice.id);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                            >
                              <FiTrash2 className="mr-3 w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Show only on small screens */}
      <div className="sm:hidden space-y-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</p>
                <p className="text-gray-600">{invoice.client?.name}</p>
              </div>
              
              {/* Three dots menu */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown(invoice.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiMoreVertical className="w-5 h-5 text-gray-500" />
                </button>

                {/* Dropdown menu */}
                {openDropdownId === invoice.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewModalOpen(true);
                          toggleDropdown(invoice.id);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <FiEye className="mr-3 w-4 h-4" />
                        View Invoice
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoiceId(invoice.id);
                          setShowEmailModal(true);
                          toggleDropdown(invoice.id);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        {sendingEmail === invoice.id ? (
                          <FiLoader className="mr-3 w-4 h-4 animate-spin" />
                        ) : (
                          <FiMail className="mr-3 w-4 h-4" />
                        )}
                        Send Email
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsEditModalOpen(true);
                          toggleDropdown(invoice.id);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <FiEdit2 className="mr-3 w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsDownloadModalOpen(true);
                          toggleDropdown(invoice.id);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <FiDownload className="mr-3 w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsDeleteModalOpen(true);
                          toggleDropdown(invoice.id);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                      >
                        <FiTrash2 className="mr-3 w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">€{invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 ">
                <span className="text-gray-500">Due Date:</span>
                <span>{new Date(invoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 ">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs 
                  ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
            onConfirm={() => selectedInvoice && handleDelete(selectedInvoice)}
            title="Delete Invoice"
            message="Are you sure you want to delete this invoice? This action cannot be undone."
            footer={
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedInvoice && handleDelete(selectedInvoice)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setIsMultiDeleteMode(true);
                    setSelectedInvoices([selectedInvoice?.id || '']);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Delete More
                </button>
              </div>
            }
          />
        </>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Send Invoice Email</h3>
            <p>Are you sure you want to send this invoice via email?</p>
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedInvoiceId && handleSendEmail(selectedInvoiceId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Email
                </button>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setIsMultiEmailMode(true);
                  setSelectedEmailInvoices([selectedInvoiceId || '']);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Send More
              </button>
            </div>
          </div>
        </div>
      )}

      {showMultiDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Delete Multiple Invoices</h3>
            <p>Are you sure you want to delete {selectedInvoices.length} selected invoices?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMultiDeleteModal(false);
                  setSelectedInvoices([]);
                  setIsMultiDeleteMode(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMultiDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {isMultiDeleteMode && selectedInvoices.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowMultiDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FiTrash2 className="w-5 h-5" />
            <span>Delete Selected ({selectedInvoices.length})</span>
          </button>
        </div>
      )}

      {isMultiEmailMode && selectedEmailInvoices.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex space-x-2">
          <button
            onClick={() => {
              setSelectedEmailInvoices([]);
              setIsMultiEmailMode(false);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <FiX className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() => setShowMultiEmailModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiMail className="w-5 h-5" />
            <span>Send Emails ({selectedEmailInvoices.length})</span>
          </button>
        </div>
      )}

      {showMultiEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Send Multiple Emails</h3>
            <p>Are you sure you want to send emails to {selectedEmailInvoices.length} selected invoices?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMultiEmailModal(false);
                  setSelectedEmailInvoices([]);
                  setIsMultiEmailMode(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMultiSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <DownloadConfirmationModal
        isOpen={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={() => {
          handleDownloadPDF(selectedInvoice!);
          setIsDownloadModalOpen(false);
        }}
        onDownloadMore={() => {
          setIsDownloadModalOpen(false);
          setIsMultiDownloadMode(true);
          setSelectedDownloadInvoices([selectedInvoice?.id || '']);
        }}
      />

      {showMultiDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Download Invoice PDF</h3>
            <p>Do you want to download this invoice as PDF?</p>
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMultiDownloadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDownloadPDF(selectedInvoice!);
                    setShowMultiDownloadModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
              <button
                onClick={() => {
                  setShowMultiDownloadModal(false);
                  setIsMultiDownloadMode(true);
                  setSelectedDownloadInvoices([selectedInvoice?.id || '']);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download More
              </button>
            </div>
          </div>
        </div>
      )}

      {isMultiDownloadMode && selectedDownloadInvoices.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 flex space-x-2">
          <button
            onClick={() => {
              setSelectedDownloadInvoices([]);
              setIsMultiDownloadMode(false);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <FiX className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleMultiDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiDownload className="w-5 h-5" />
            <span>Download PDFs ({selectedDownloadInvoices.length})</span>
          </button>
        </div>
      )}
    </>
  );
} 