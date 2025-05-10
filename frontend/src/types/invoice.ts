import { Client } from './client';
import { Settings } from './settings';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  name: string;
  description?: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  date: string;
  notes: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  created_at?: string;
  updated_at?: string;
  client?: {
    name: string;
    email: string;
    address: string;
    currency: string;
    company?: string;
  };
  settings?: Settings;
} 