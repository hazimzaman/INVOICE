export interface Settings {
  id?: string;
  user_id?: string;
  business_name: string;
  business_logo: string;
  business_address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  wise_email: string;
  invoice_prefix: string;
  footer_note: string;
  current_invoice_number: number;
  email_template: string;
  email_subject: string;
  email_signature: string;
  cc_email: string;
  bcc_email: string;
  created_at?: string;
  updated_at?: string;
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