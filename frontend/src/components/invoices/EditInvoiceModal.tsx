'use client';

import { useState } from 'react';
import { FiX, FiPlus, FiTrash } from 'react-icons/fi';
import { Invoice, InvoiceItem } from '@/types/invoice';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
}

export default function EditInvoiceModal({ isOpen, onClose, invoice, onSave }: EditInvoiceModalProps) {
  const [items, setItems] = useState<InvoiceItem[]>(invoice.items);
  const [dueDate, setDueDate] = useState(invoice.dueDate);

  const handleAddItem = () => {
    setItems([...items, { id: `new-${Date.now()}`, name: '', price: 0, description: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...invoice,
      items,
      dueDate,
      total: calculateTotal()
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-lg w-full max-w-[800px] p-6 shadow-xl transform transition-all duration-300 scale-100 h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Invoice #{invoice.invoiceNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-6 flex-none">
            {/* Client Info - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <input
                type="text"
                value={`${invoice.client.name} - ${invoice.client.company}`}
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 min-h-0 mt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FiPlus className="text-lg" />
                Add Item
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 max-h-[calc(100%-2rem)]">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      placeholder="Item name"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      placeholder="Price"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Description"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center pt-6">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total and Buttons */}
          <div className="flex-none space-y-6 mt-6 pt-4 border-t">
            {/* Total */}
            <div className="flex justify-end">
              <div className="text-right">
                <span className="text-gray-600">Total: </span>
                <span className="text-xl font-bold text-gray-900">
                  {invoice.client.currency}{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 