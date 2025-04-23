export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

// New type for creating clients
export type NewClient = Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>; 