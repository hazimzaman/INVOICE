'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInvoices } from '@/store/slices/invoicesSlice';
import { fetchClients } from '@/store/slices/clientsSlice';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import InvoicesTable from './InvoicesTable';
import AddInvoiceModal from './AddInvoiceModal';
import { FiPlus, FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiClock, FiCalendar, FiDollarSign, FiCheckCircle, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { InvoiceActions } from './InvoiceActions';
import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';

type FilterType = 'all' | 'highest_paid' | 'lowest_paid' | 'latest' | 'oldest' | 'status';

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { invoices } = useAppSelector((state) => state.invoices);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      dispatch(fetchInvoices());
      dispatch(fetchClients());
    };

    checkAuth();
  }, [dispatch, router]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();
      setSettings(settingsData);
    };
    fetchSettings();
  }, []);

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <section className="pt-30 pb-20 pl-6 pr-6  ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* Header */}
          <div className="max-w-[1240px] w-full mx-auto  flex flex-col justify-between items-center gap-6 md:flex-row ">
            <h1 className="text-2xl font-bold">Invoices</h1>
            
            <div className="w-full flex gap-2 flex-col sm:flex-row">
              {/* Search */}
              <div className="w-[100%] relative flex-1 ">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

             <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-row '>
                    {/* Filters Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex w-full items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-full"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                {/* Filters Dropdown */}
                {isFilterDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setIsFilterDropdownOpen(false)}
                    />
                    <div className="absolute left-[-9%] mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter By
                          </label>
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setFilterType('highest_paid');
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-50 flex items-center ${
                                filterType === 'highest_paid' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <FiArrowUp className="w-4 h-4 mr-2" />
                              <span>Highest Amount First</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setFilterType('lowest_paid');
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-50 flex items-center ${
                                filterType === 'lowest_paid' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <FiArrowDown className="w-4 h-4 mr-2" />
                              <span>Lowest Amount First</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setFilterType('latest');
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-50 flex items-center ${
                                filterType === 'latest' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <FiClock className="w-4 h-4 mr-2" />
                              <span>Latest Invoices</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setFilterType('oldest');
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-50 flex items-center ${
                                filterType === 'oldest' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <FiCalendar className="w-4 h-4 mr-2" />
                              <span>Oldest Invoices</span>
                            </button>
                            
                            <div className="pt-2 border-t">
                              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FiDollarSign className="w-4 h-4 mr-2" />
                                Filter by Status
                              </label>
                              <select
                                value={statusFilter}
                                onChange={(e) => {
                                  setStatusFilter(e.target.value);
                                  setFilterType('status');
                                  setIsFilterDropdownOpen(false);
                                }}
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setFilterType('all');
                            setStatusFilter('all');
                            setIsFilterDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Add Invoice Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Invoice</span>
              </button>

              {/* Select Invoice Button - Disabled when no invoices */}
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                disabled={!invoices?.length}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSelectionMode 
                    ? 'bg-gray-200 text-gray-800' 
                    : invoices?.length 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiCheck className="w-5 h-5" />
                <span>{isSelectionMode ? 'Cancel Selection' : 'Select'}</span>
              </button>
             </div>
              
            </div>
          </div>
        </div>

        {/* Table */}
        <InvoicesTable 
          searchQuery={searchQuery} 
          filterType={filterType}
          statusFilter={statusFilter}
          isSelectionMode={isSelectionMode}
          setIsSelectionMode={setIsSelectionMode}
          onSelectInvoice={handleInvoiceSelect}
        />

        {/* Add Invoice Modal */}
        <AddInvoiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />

        {/* Only show InvoiceActions when an invoice is selected */}
        {selectedInvoice && settings && (
          <div className="mt-4">
            <InvoiceActions 
              invoice={selectedInvoice} 
              settings={settings} 
            />
          </div>
        )}
      </div>
    </section>
  );
} 


