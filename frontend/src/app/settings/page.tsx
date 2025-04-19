import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SettingsPage from '@/components/settings/SettingsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
} 