import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BusinessInfo {
  name: string;
  logo: string;
  address: string;
}

interface ContactInfo {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  wiseEmail: string;
}

interface InvoiceSettings {
  invoiceNumberPrefix: string;
  footerNote: string;
  currentInvoiceNumber: number;
}

interface EmailSettings {
  defaultEmailContent: string;
}

interface SettingsState {
  business: BusinessInfo;
  contact: ContactInfo;
  invoice: InvoiceSettings;
  email: EmailSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  business: {
    name: '',
    logo: '',
    address: '',
  },
  contact: {
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    wiseEmail: '',
  },
  invoice: {
    invoiceNumberPrefix: 'INV-',
    footerNote: '',
    currentInvoiceNumber: 1,
  },
  email: {
    defaultEmailContent: '',
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateBusinessInfo: (state, action: PayloadAction<BusinessInfo>) => {
      state.business = action.payload;
    },
    updateContactInfo: (state, action: PayloadAction<ContactInfo>) => {
      state.contact = action.payload;
    },
    updateInvoiceSettings: (state, action: PayloadAction<InvoiceSettings>) => {
      state.invoice = action.payload;
    },
    updateEmailSettings: (state, action: PayloadAction<EmailSettings>) => {
      state.email = action.payload;
    },
  },
});

export const { 
  updateBusinessInfo, 
  updateContactInfo, 
  updateInvoiceSettings,
  updateEmailSettings 
} = settingsSlice.actions;
export default settingsSlice.reducer; 