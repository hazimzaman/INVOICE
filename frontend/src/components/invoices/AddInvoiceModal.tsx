import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Client } from '@/types/client';
import { InvoiceItem } from '@/types/invoice';
import { addInvoice } from '@/store/slices/invoicesSlice';
import { toast } from 'react-hot-toast';
import { updateSettings, fetchSettings } from '@/store/slices/settingsSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInvoiceModal({ isOpen, onClose }: AddInvoiceModalProps) {
  const dispatch = useAppDispatch();
  const { clients } = useAppSelector((state) => state.clients);
  const { data: settings, loading: settingsLoading } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings());
    }
  }, [dispatch, settings]);

  const generateInvoiceNumber = () => {
    if (!settings) return '';
    
    const prefix = settings.invoice_prefix || 'INV';
    const currentNumber = settings.current_invoice_number || 1;
    const paddedNumber = String(currentNumber).padStart(3, '0');
    return `${prefix}${paddedNumber}`;
  };

  const [formData, setFormData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [] as InvoiceItem[]
  });

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    amount: 0
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, client_id: clientId }));
  };

  const addItem = () => {
    if (!newItem.name || newItem.amount <= 0) return;
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setNewItem({
      name: '',
      description: '',
      amount: 0
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (settingsLoading) {
        toast.error('Please wait while settings are loading');
        return;
      }

      if (!settings) {
        await dispatch(fetchSettings()).unwrap();
      }

      if (!settings) {
        toast.error('Settings not found. Please configure your settings first.');
        return;
      }

      if (!formData.client_id) {
        toast.error('Please select a client');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      const invoiceData = {
        ...formData,
        invoice_number: generateInvoiceNumber(),
        status: 'pending' as const,
        subtotal: calculateTotal(),
        total: calculateTotal()
      };

      await dispatch(addInvoice(invoiceData)).unwrap();
      
      // Increment the invoice number in settings
      await dispatch(updateSettings({
        settings: {
          current_invoice_number: (settings.current_invoice_number || 1) + 1
        }
      })).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  if (settingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold">Create New Invoice</Dialog.Title>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block font-medium mb-2">Client</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.company || 'No company'}) - {client.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                    required
                  />
                </div>
                
              </div>

              {/* Items Section */}
              <div className="max-h-[300px] overflow-y-auto">
                <h3 className="font-medium mb-2">Items</h3>
                
                {/* Existing Items */}
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded">
                    <div className="flex-1">{item.name}</div>
                    <div className="flex-1">{item.description}</div>
                    <div className="w-24 text-right">${item.amount.toFixed(2)}</div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}

                {/* Add New Item */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="p-2 border border-[var(--color-gray-300)] rounded"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="p-2 border border-[var(--color-gray-300)] rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newItem.amount || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="p-2 border  border-[var(--color-gray-300)] rounded w-full"
                    />
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="text-right">
                <div className="text-lg font-bold">
                  Total: {selectedClient?.currency || '$'}{calculateTotal().toFixed(2)}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 