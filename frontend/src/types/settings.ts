export interface Settings {
  id: string;
  user_id: string;
  business_name: string | null;
  business_logo: string | null;
  business_address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  wise_email: string | null;
  invoice_prefix: string;
  footer_note: string | null;
  current_invoice_num: number;
  created_at: string;
  updated_at: string;
  email_template: string | null;
  email_subject: string | null;
  email_signature: string;
  cc_email: string;
  bcc_email: string;
}

export interface BusinessInfo {
  name: string;
  logo?: string;
  address: string;
  contactPhone: string;
  contactName: string;
  contactEmail: string;
  wiseEmail: string;
}

export const defaultSettings: Partial<Settings> = {
  invoice_prefix: 'INV-',
  current_invoice_num: 1
}; 