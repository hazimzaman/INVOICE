import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { updateInvoice } from '@/store/slices/invoicesSlice';
import { toast } from 'react-hot-toast';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export default function EditInvoiceModal({ isOpen, onClose, invoice }: EditInvoiceModalProps) {
  const dispatch = useAppDispatch();
  const { clients } = useAppSelector((state) => state.clients);

  const [formData, setFormData] = useState({
    client_id: invoice.client_id,
    invoice_number: invoice.invoice_number,
    date: invoice.date,
    due_date: invoice.due_date,
    status: invoice.status,
    notes: invoice.notes || '',
    items: [...(invoice.items || [])]
  });

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    amount: 0
  });

  // Reset form when invoice changes
  useEffect(() => {
    setFormData({
      client_id: invoice.client_id,
      invoice_number: invoice.invoice_number,
      date: invoice.date,
      due_date: invoice.due_date,
      status: invoice.status,
      notes: invoice.notes || '',
      items: [...(invoice.items || [])]
    });
  }, [invoice]);

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
      if (!formData.client_id) {
        toast.error('Please select a client');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      const updateData = {
        ...formData,
        subtotal: calculateTotal(),
        total: calculateTotal()
      };

      await dispatch(updateInvoice({ id: invoice.id, data: updateData })).unwrap();
      toast.success('Invoice updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold">Edit Invoice</Dialog.Title>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.company || 'No company'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Details */}
              <div className="grid mb-2  gap-4 xs:grid-cols-2 sm:grid-cols-3">
                <div className='flex flex-col justify-between'>
                  <label className="block font-medium mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                    required
                  />
                </div>
                <div className='flex flex-col justify-between'>
                  <label className="block font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as Invoice['status']
                    }))}
                    className="w-full p-2 border border-[var(--color-gray-300)] rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
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
                <div className="grid  gap-4  xs:grid-cols-2 sm:grid-cols-3">
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
                      className="p-2 border border-[var(--color-gray-300)] rounded w-full"
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
                  Total: ${calculateTotal().toFixed(2)}
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
                  Update Invoice
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 