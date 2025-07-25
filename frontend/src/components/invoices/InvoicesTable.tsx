'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInvoices, deleteInvoice } from '@/store/slices/invoicesSlice';
import { FiEye, FiEdit2, FiTrash2, FiMail, FiCalendar, FiChevronDown, FiDownload, FiFilter, FiArrowUp, FiArrowDown, FiClock, FiDollarSign, FiCheckCircle, FiAlertCircle, FiSend, FiMoreVertical, FiLoader, FiX } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import ViewInvoiceModal from './ViewInvoiceModal';
import EditInvoiceModal from './EditInvoiceModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { generatePDF, getInvoiceFilename } from '@/utils/generatePDF';
import { sendEmail } from '@/utils/email';
import { formatDate } from '@/utils/dateFormat';
import { Settings } from '@/types/settings';
import DownloadConfirmationModal from './DownloadConfirmationModal';
import { parseEmailTemplate } from '@/utils/emailTemplate';
import { fetchSettings } from '@/store/slices/settingsSlice';

interface InvoicesTableProps {
  searchQuery: string;
  filterType: string;
  statusFilter: string;
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

type SortOrder = 'asc' | 'desc';
type SortField = 'date' | 'amount' | 'status';
type FilterType = 'all' | 'highest_paid' | 'lowest_paid' | 'latest' | 'oldest' | 'status';

interface LoadingState {
  download: boolean;
  email: boolean;
  delete: boolean;
}

export default function InvoicesTable({ 
  searchQuery, 
  filterType, 
  statusFilter,
  isSelectionMode,
  setIsSelectionMode,
  onSelectInvoice
}: InvoicesTableProps) {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector((state) => state.invoices);
  const { data: settings, loading: settingsLoading, error: settingsError } = useAppSelector(state => state.settings);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
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
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'download' | 'email' | 'delete' | 'status' | null>(null);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'paid' | 'overdue' | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  const defaultSettings: Partial<Settings> = {
    business_name: '',
    business_logo: '',
    business_address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    wise_email: '',
    invoice_prefix: null,
    footer_note: '',
    current_invoice_num: 1,
    email_template: '',
    email_subject: '',
    email_signature: null
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!settings) {
          await dispatch(fetchSettings()).unwrap();
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    initializeData();
  }, [dispatch, settings]);

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
      setLoadingStates(prev => ({
        ...prev,
        [invoice.id]: { ...prev[invoice.id], download: true }
      }));
      
      const pdfBlob = await generatePDF(invoice, settings || {
        ...defaultSettings,
        id: 'default',
        user_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Settings);

      // Create download URL
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getInvoiceFilename(invoice);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [invoice.id]: { ...prev[invoice.id], download: false }
      }));
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      setEmailingId(invoice.id);

      if (!invoice.client?.email) {
        throw new Error('Client email is required');
      }

      // Generate PDF with complete settings
      const pdfBlob = await generatePDF(invoice, settings || {
        ...defaultSettings,
        id: 'default',
        user_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Settings);
      
      const base64PDF = await blobToBase64(pdfBlob);

      // Send email
      const response = await sendEmail({
        to: invoice.client.email,
        from: settings?.wise_email || '',
        subject: `${settings?.invoice_prefix || ''}${invoice.invoice_number} from ${settings?.business_name || ''}`,
        body: parseEmailTemplate(settings?.email_template || '', {
          clientName: invoice.client.name,
          invoiceNumber: `${settings?.invoice_prefix || ''}${invoice.invoice_number}`,
          amount: `${invoice.client?.currency || '€'}${invoice.total.toFixed(2)}`,
          businessName: settings?.business_name || '',
          dueDate: formatDate(invoice.date),
          items: invoice.items?.map(item => ({
            name: item.name || item.description || 'Unnamed Item',
            quantity: 1,
            price: item.amount,
            total: item.amount
          })) || []
        }),
        attachment: {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: base64PDF,
          encoding: 'base64',
          type: 'application/pdf'
        }
      });

      // Handle both Response objects and direct returns
      const success = response instanceof Response ? response.ok : response;

      if (!success) {
        throw new Error('Failed to send email');
      }

        toast.success('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setEmailingId(null);
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
      setLoadingStates(prev => ({
        ...prev,
        [invoice.id]: { ...prev[invoice.id], delete: true }
      }));
      
      await dispatch(deleteInvoice(invoice.id)).unwrap();
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete invoice');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [invoice.id]: { ...prev[invoice.id], delete: false }
      }));
    }
  };

  const toggleDropdown = (invoiceId: string) => {
    setOpenDropdownId(openDropdownId === invoiceId ? null : invoiceId);
  };

  const handleMultiDelete = async () => {
    setShowMultiDeleteModal(false);
    try {
      await Promise.all(
        selectedInvoices.map(id => dispatch(deleteInvoice(id)))
      );
      toast.success('Invoices deleted successfully');
      setSelectedInvoices([]);
      setIsMultiDeleteMode(false);
    } catch (error) {
      toast.error('Failed to delete some invoices');
    }
  };

  const handleRowClick = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation(); // Prevent event bubbling
    if (isSelectionMode) {
      // Handle multi-select logic
      const isSelected = selectedInvoices.includes(invoice.id);
    setSelectedInvoices(prev => 
        isSelected ? prev.filter(id => id !== invoice.id) : [...prev, invoice.id]
    );
    } else {
      onSelectInvoice(invoice);
    }
  };

  const handleMultiSendEmail = async () => {
    setShowMultiEmailModal(false);
    try {
      for (const id of selectedEmailInvoices) {
        const invoice = invoices.find(i => i.id === id);
        if (!invoice) continue;
        setLoadingStates(prev => ({
          ...prev,
          [`send_${id}`]: { download: false, email: true, delete: false }
        }));
        await handleSendEmail(invoice);
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
        setLoadingStates(prev => ({
          ...prev,
          [`download_${id}`]: { download: true, email: false, delete: false }
        }));
        await handleDownloadPDF(invoice);
        setLoadingStates(prev => ({
          ...prev,
          [`download_${id}`]: { download: false, email: false, delete: false }
        }));
      }
      setSelectedDownloadInvoices([]);
      setIsMultiDownloadMode(false);
      toast.success('All PDFs downloaded successfully');
    } catch (error) {
      toast.error('Failed to download some PDFs');
    }
  };

  const handleBulkStatusUpdate = async (invoices: Invoice[], newStatus: string) => {
    try {
      await Promise.all(
        invoices.map(invoice => 
          supabase
            .from('invoices')
            .update({ 
              status: newStatus, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', invoice.id)
        )
      );
      dispatch(fetchInvoices());
      toast.success('Status updated for all selected invoices');
    } catch (error) {
      throw new Error('Failed to update status');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkActionType || selectedInvoices.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      const selectedInvoiceObjects = invoices.filter(inv => selectedInvoices.includes(inv.id));
      
      switch (bulkActionType) {
        case 'download':
          for (const invoice of selectedInvoiceObjects) {
            await handleDownloadPDF(invoice);
          }
          toast.success('All invoices downloaded successfully');
          break;
          
        case 'email':
          for (const invoice of selectedInvoiceObjects) {
            await handleSendEmail(invoice);
          }
          toast.success('All emails sent successfully');
          break;
          
        case 'delete':
          for (const invoice of selectedInvoiceObjects) {
            await handleDelete(invoice);
          }
          toast.success('All selected invoices deleted');
          break;
          
        case 'status':
          if (!selectedStatus) {
            toast.error('Please select a status');
            return;
          }
          await handleBulkStatusUpdate(selectedInvoiceObjects, selectedStatus);
          break;
      }
      
      // Reset selection state
      setSelectedInvoices([]);
      setIsSelectionMode(false);
      setShowBulkActions(false);
      setBulkActionType(null);
      setSelectedStatus(null);
      
    } catch (error) {
      toast.error(`Failed to ${bulkActionType} some invoices`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleDateClick = (invoiceId: string, currentDate: string) => {
    setEditingDate(invoiceId);
  };

  const handleStatusClick = (invoiceId: string) => {
    setEditingStatus(invoiceId);
  };

  const handleCardClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleInvoiceSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent row click when clicking checkbox
    setSelectedInvoices(prev => 
      prev.includes(id)
        ? prev.filter(id => id !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allInvoiceIds = getFilteredAndSortedInvoices().map(invoice => invoice.id);
      setSelectedInvoices(allInvoiceIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Table Header Actions */}
      

      {/* Table view for sm and above */}
      <div className="hidden sm:block ">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr className="border-b border-gray-200">
              {isSelectionMode && (
                <th className="text-center px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === getFilteredAndSortedInvoices().length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 cursor-pointer"
                  />
                </th>
              )}
              
              <th className="text-center  p-2 font-semibold text-gray-600">INVOICE #</th>
              <th className="text-center p-2 font-semibold text-gray-600">CLIENTS</th>
              <th className="text-center p-2 font-semibold text-gray-600 ">AMOUNT</th>
              <th className="text-center p-2 font-semibold text-gray-600">DATE</th>
              <th className="text-center p-2 font-semibold text-gray-600">STATUS</th>
              <th className="text-center p-2 font-semibold text-gray-600">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No invoices found. Create your first invoice to get started.
                </td>
              </tr>
            ) : (
              getFilteredAndSortedInvoices().map((invoice) => (
                <tr 
                  key={invoice.id}
                  onClick={(e) => handleRowClick(e, invoice)}
                  className={ ` cursor-pointer hover:bg-gray-50 ${
                    selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''
                  }`}
                >
                {isSelectionMode && (
                    <td className="text-center px-6 py-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => handleInvoiceSelect(invoice.id, e)}
                      className="rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </td>
                )}
                  <td className="text-center px-6 py-4">
                    <span className="text-gray-900">
                      {settings?.invoice_prefix || ''}{invoice.invoice_number.match(/\d+$/)?.[0] || invoice.invoice_number}
                    </span>
                  </td>
                  <td className="text-center px-6 py-4">{invoice.client?.name}</td>
                  <td className="text-center px-6 py-4">${invoice.total}</td>
                  <td className="text-center px-6 py-4 hidden md:block">
                  {editingDate === invoice.id ? (
                    <input
                      type="date"
                      defaultValue={invoice.date}
                        className="w-full p-1 border rounded-md cursor-pointer"
                      onChange={(e) => {
                        handleDateUpdate(invoice.id, e.target.value);
                        setEditingDate(null);
                      }}
                      onBlur={() => setEditingDate(null)}
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={() => handleDateClick(invoice.id, invoice.date)}
                        className=" hover:text-blue-600 cursor-pointer"
                    >
                      {formatDate(invoice.date)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 relative">
                  {editingStatus === invoice.id ? (
                    <select
                      value={invoice.status}
                      onChange={(e) => {
                        handleStatusUpdate(invoice.id, e.target.value);
                        setEditingStatus(null);
                      }}
                      onBlur={() => setEditingStatus(null)}
                        className="w-full p-3.5 border rounded-md cursor-pointer"
                      autoFocus
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  ) : (
                    <div 
                      onClick={() => handleStatusClick(invoice.id)}
                        className=" w-auto cursor-pointer "
                    >
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                        setSelectedInvoice(invoice);
                        setIsViewModalOpen(true);
                      }}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                        setSelectedInvoice(invoice);
                        setIsEditModalOpen(true);
                      }}
                        className="p-2 text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(invoice);
                        }}
                      disabled={loadingStates[invoice.id]?.download}
                        className="p-2 text-purple-500 hover:text-purple-700 transition-colors relative cursor-pointer"
                    >
                      {loadingStates[invoice.id]?.download ? (
                        <div className="animate-spin">
                          <FiLoader className="w-5 h-5" />
                        </div>
                      ) : (
                        <FiDownload className="w-5 h-5" />
                      )}
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendEmail(invoice);
                        }}
                        disabled={emailingId === invoice.id}
                        className={`p-2 text-green-500 hover:text-green-700 transition-colors relative cursor-pointer ${
                          emailingId === invoice.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {emailingId === invoice.id ? (
                          <div className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                              <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                                fill="none"
                              />
                              <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Sending...
                        </div>
                      ) : (
                        <FiMail className="w-5 h-5" />
                      )}
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(invoice);
                        }}
                      disabled={loadingStates[invoice.id]?.delete}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors relative cursor-pointer"
                    >
                      {loadingStates[invoice.id]?.delete ? (
                        <div className="animate-spin text-red-500">
                          <FiLoader className="w-5 h-5" />
                        </div>
                      ) : (
                        <FiTrash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Mobile Actions Menu */}
                  <div className="lg:hidden relative">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(openActionMenu === invoice.id ? null : invoice.id);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      <FiMoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openActionMenu === invoice.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(null);
                            }}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                              setSelectedInvoice(invoice);
                              setIsViewModalOpen(true);
                              setOpenActionMenu(null);
                            }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FiEye className="w-4 h-4" /> View
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                              setSelectedInvoice(invoice);
                              setIsEditModalOpen(true);
                              setOpenActionMenu(null);
                            }}
                              className="w-full px-4 py-2 text-left text-sm text-indigo-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FiEdit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                              handleDownloadPDF(invoice);
                              setOpenActionMenu(null);
                            }}
                              className="w-full px-4 py-2 text-left text-sm text-purple-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FiDownload className="w-4 h-4" /> Download
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                              handleSendEmail(invoice);
                              setOpenActionMenu(null);
                            }}
                              disabled={emailingId === invoice.id}
                              className={`w-full px-4 py-2 text-left text-sm text-green-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                                emailingId === invoice.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {emailingId === invoice.id ? (
                                <div className="flex items-center">
                                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Sending...
                                </div>
                              ) : (
                                <FiMail className="w-4 h-4" />
                              )}
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                              handleDelete(invoice);
                              setOpenActionMenu(null);
                            }}
                              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No matching invoices found.' : 'No invoices found. Create your first invoice to get started.'}
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredAndSortedInvoices().map((invoice) => (
              <div 
                key={invoice.id} 
                className="bg-gray-100 rounded-lg shadow-md border border-gray-100 cursor-pointer"
                onClick={(e) => handleCardClick(invoice)}
              >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => handleInvoiceSelect(invoice.id, e)}
                      className="rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Invoice Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">#{invoice.invoice_number}</h3>
                      <p className="text-gray-600">{invoice.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${invoice.total}</p>
                      <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                    </div>
                  </div>

                  {/* Status and Actions Row */}
                  <div className="flex justify-between items-center pt-2">
                    {/* Status */}
                    <div>
                      {editingStatus === invoice.id ? (
                        <select
                          value={invoice.status}
                          onChange={(e) => {
                            handleStatusUpdate(invoice.id, e.target.value);
                            setEditingStatus(null);
                          }}
                          onBlur={() => setEditingStatus(null)}
                          className="w-full p-1 border rounded-md cursor-pointer"
                          autoFocus
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      ) : (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusClick(invoice.id);
                          }}
                          className="cursor-pointer inline-block"
                        >
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(openActionMenu === invoice.id ? null : invoice.id);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openActionMenu === invoice.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-[60]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(null);
                            }}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-[70] py-1 border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(invoice);
                                setIsViewModalOpen(true);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                            >
                              <FiEye className="w-4 h-4" /> View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(invoice);
                                setIsEditModalOpen(true);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-indigo-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                            >
                              <FiEdit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(invoice);
                                setOpenActionMenu(null);
                              }}
                              disabled={loadingStates[invoice.id]?.download}
                              className="w-full px-4 py-2 text-left text-sm text-purple-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                            >
                              {loadingStates[invoice.id]?.download ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiDownload className="w-4 h-4" />
                              )}{' '}
                              Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(invoice);
                                setOpenActionMenu(null);
                              }}
                              disabled={emailingId === invoice.id}
                              className={`w-full px-4 py-2 text-left text-sm text-green-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                                emailingId === invoice.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {emailingId === invoice.id ? (
                                <div className="flex items-center">
                                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Sending...
                                </div>
                              ) : (
                                <FiMail className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(invoice);
                                setOpenActionMenu(null);
                              }}
                              disabled={loadingStates[invoice.id]?.delete}
                              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                            >
                              {loadingStates[invoice.id]?.delete ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}{' '}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Button */}
      {isSelectionMode && (
        <div className="fixed bottom-8 right-8 flex gap-2">
          <button
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedInvoices([]);
            }}
            className="px-4 py-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowBulkActions(true)}
            disabled={selectedInvoices.length === 0}
            className={`px-6 py-2 rounded-lg shadow ${
              selectedInvoices.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next ({selectedInvoices.length})
          </button>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bulk Actions</h2>
              <button 
                onClick={() => {
                  setShowBulkActions(false);
                  setBulkActionType(null);
                  setSelectedStatus(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setBulkActionType('download')}
                className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  bulkActionType === 'download' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <FiDownload className="w-5 h-5" />
                <span>Download Selected Invoices</span>
              </button>

              <button
                onClick={() => setBulkActionType('email')}
                className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  bulkActionType === 'email' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <FiMail className="w-5 h-5" />
                <span>Send Email</span>
              </button>

              <button
                onClick={() => setBulkActionType('delete')}
                className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  bulkActionType === 'delete' 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <FiTrash2 className="w-5 h-5" />
                <span>Delete Selected Invoices</span>
              </button>

              <div
                onClick={() => setBulkActionType('status')}
                className={`w-full p-3 rounded-lg transition-colors ${
                  bulkActionType === 'status' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="w-5 h-5" />
                  <span className="text-gray-700">Update Status</span>
                </div>
                
                {bulkActionType === 'status' && (
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => setSelectedStatus(e.target.value as 'pending' | 'paid' | 'overdue')}
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkActions(false);
                  setBulkActionType(null);
                  setSelectedStatus(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {(bulkActionType && (bulkActionType !== 'status' || selectedStatus)) && (
                <button
                  onClick={handleBulkAction}
                  disabled={isBulkActionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {isBulkActionLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedInvoice && (
          <ViewInvoiceModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
      )}

      {/* Edit Modal */}
      {selectedInvoice && (
          <EditInvoiceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
      )}
    </div>
  );
} 

// Utility functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}; 