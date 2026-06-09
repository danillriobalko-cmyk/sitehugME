import { useAuth } from '@/hooks/use-auth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-accent text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminPanel />;
}
