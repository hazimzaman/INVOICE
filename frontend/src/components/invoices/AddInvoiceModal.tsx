import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
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

interface InvoiceFormData {
  client_id: string;
  date: string;
  notes: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
}

interface NewItem {
  name: string;
  description: string;
  amount: number;
}

const EditableDateField = ({ date, onChange }: { date: string; onChange: (date: string) => void }) => {
  const [editing, setEditing] = useState(false);

  const formatDisplayDate = (isoDate: string): string => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <label className="block font-medium mb-2">Date</label>
      <div className="relative w-[30%]">
        {editing ? (
          <input
            type="date"
            defaultValue={date}
            onChange={(e) => {
              onChange(e.target.value);
              setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            className="w-full p-2 border border-[var(--color-gray-300)] rounded cursor-pointer bg-white"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="w-full p-2 border border-[var(--color-gray-300)] rounded bg-white cursor-pointer hover:text-blue-600"
          >
            {formatDisplayDate(date)}
          </div>
        )}
      </div>
    </div>
  );
};

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
    const currentNumber = settings.current_invoice_num;
    const paddedNumber = String(currentNumber).padStart(3, '0');
    return settings.invoice_prefix ? `${settings.invoice_prefix}${paddedNumber}` : paddedNumber;
  };

  const initialFormState: InvoiceFormData = {
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
    subtotal: 0,
    total: 0
  };

  const initialItemState = {
    name: '',
    description: '',
    amount: 0
  } as const;

  const [formData, setFormData] = useState(initialFormState);
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    description: '',
    amount: 0
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const resetForm = () => {
    setFormData(initialFormState);
    setNewItem({
      name: '',
      description: '',
      amount: 0
    });
    setSelectedClient(null);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, client_id: clientId }));
  };

  const isItemValid = () => {
    return newItem.name.trim() !== '' &&
      newItem.description.trim() !== '' &&
      newItem.amount > 0;
  };

  const addItem = () => {
    if (!isItemValid()) {
      toast.error('Please fill in all item details');
      return;
    }

    setFormData(prev => {
      const updatedItems = [...prev.items, newItem];
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

      return {
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      };
    });

    setNewItem({
      name: '',
      description: '',
      amount: 0
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!settings) {
        toast.error('Settings not found. Please configure your settings first.');
        return;
      }

      if (!formData.client_id) {
        toast.error('Please select a client');
        return;
      }

      let finalFormData = formData;
      if (isItemValid()) {
        const updatedItems = [...formData.items, newItem];
        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        finalFormData = {
          ...formData,
          items: updatedItems,
          subtotal: newSubtotal,
          total: newSubtotal
        };
      }

      if (finalFormData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      const invoiceData = {
        ...finalFormData,
        invoice_number: generateInvoiceNumber(),
        status: 'pending' as const
      };

      await dispatch(addInvoice(invoiceData)).unwrap();

      await dispatch(updateSettings({
        id: settings.id,
        user_id: settings.user_id,
        current_invoice_num: settings.current_invoice_num + 1
      })).unwrap();

      toast.success('Invoice created successfully');

      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <EditableDateField
                date={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
              />

              <div className="max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!isItemValid()}
                    className={`px-4 py-2 rounded text-sm ${
                      isItemValid()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiPlus className="w-4 h-4 inline-block mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          {selectedClient?.currency || '$'}{item.amount.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-[55px] px-4 border border-[var(--color-gray-300)] rounded"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-[55px] px-4 border border-[var(--color-gray-300)] rounded"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newItem.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setNewItem(prev => ({ ...prev, amount }));
                    }}
                    className={`p-2 border rounded w-full ${
                      isItemValid() ? 'border-green-500 font-bold' : 'border-[var(--color-gray-300)]'
                    }`}
                  />
                </div>

                <div className="mt-6 text-right">
                  <p className="text-lg font-semibold">
                    Total: {selectedClient?.currency || '$'}
                    {(formData.total + (isItemValid() ? newItem.amount : 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleClose}
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
