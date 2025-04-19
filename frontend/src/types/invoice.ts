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
  date: string;
  dueDate: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
  status: 'pending' | 'paid';
} 