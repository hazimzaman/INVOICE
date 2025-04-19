import { Client } from './client';

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
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