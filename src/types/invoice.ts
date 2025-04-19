export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  currency: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  total: number;
} 