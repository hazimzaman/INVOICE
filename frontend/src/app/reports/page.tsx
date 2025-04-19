import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ReportsPage from '@/components/reports/ReportsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
} 