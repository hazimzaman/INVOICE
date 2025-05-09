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
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  subtotal: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items: Array<{
    name: string;
    description: string;
    amount: number;
  }>;
  client?: {
    name: string;
    email: string;
    address: string;
    currency: string;
    company?: string;
  };
  settings?: Settings;
} 