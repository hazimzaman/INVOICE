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
      {/* ... other inputs ... */}
    </form>
  );
}

// Remove the due_date input field from the JSX
// Remove any references to due_date in the handleSubmit function 