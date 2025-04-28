import { useState } from 'react';
      
export default function CreateInvoiceForm() {
  const [formData, setFormData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    items: [{ name: '', description: '', amount: 0 }],
    notes: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  // Update item fields and automatically add new row if last row is being filled
  const handleItemChange = (index: number, field: keyof typeof formData.items[0], value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If this is the last item and any field is filled, add a new empty item
    if (index === formData.items.length - 1 && 
        (newItems[index].name || newItems[index].description || newItems[index].amount > 0)) {
      newItems.push({ name: '', description: '', amount: 0 });
    }

    // Remove empty rows except the last one
    const filteredItems = newItems.filter((item, idx) => {
      if (idx === newItems.length - 1) return true;
      return item.name || item.description || item.amount > 0;
    });

    setFormData(prev => ({ ...prev, items: filteredItems }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={formData.client_id}
        onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
        className="w-full p-2 border border-[var(--color-gray-300)] rounded"
        required
      />

      <input
        type="text"
        value={formData.invoice_number}
        onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
        className="w-full p-2 border border-[var(--color-gray-300)] rounded"
        required
      />

      {/* Items Section */}
      <div className="space-y-4">
        <label className="block font-medium">Items</label>
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                className="w-full h-[55px] px-4 border border-[var(--color-gray-300)] rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="w-full h-[55px] px-4 border border-[var(--color-gray-300)] rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={item.amount || ''}
                onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                className="w-full h-[55px] px-4 border border-[var(--color-gray-300)] rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="text-right">
        <div className="text-lg font-bold">
          Total: ${formData.items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
        </div>
      </div>

      {/* ... rest of the form ... */}
    </form>
  );
}

// Remove the due_date input field from the JSX
// Remove any references to due_date in the handleSubmit function 