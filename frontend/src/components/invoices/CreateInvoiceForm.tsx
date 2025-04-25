import { useState } from 'react';
import { InvoiceStatus } from '@/types/invoice';

const [formData, setFormData] = useState({
  client_id: '',
  date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  items: [{ name: '', description: '', amount: 0 }],
  notes: '',
  status: 'pending' as InvoiceStatus
});

// Remove the due_date input field from the JSX
// Remove any references to due_date in the handleSubmit function 