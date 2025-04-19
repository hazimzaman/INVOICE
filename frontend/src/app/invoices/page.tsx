import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InvoicesPage from '@/components/invoices/InvoicesPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <InvoicesPage />
    </ProtectedRoute>
  );
} 