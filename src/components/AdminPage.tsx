import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPanel } from '@/components/admin/AdminPanel';

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      {children}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading, isAdmin, signOut } = useAuth();

  // 1. Сессия ещё проверяется.
  if (loading) {
    return (
      <Screen>
        <div className="text-accent text-lg animate-pulse">Loading...</div>
      </Screen>
    );
  }

  // 2. Не залогинен -> форма входа.
  if (!user) {
    return <AdminLogin />;
  }

  // 3. Профиль ещё резолвится (is_admin неизвестен).
  if (isAdmin === null) {
    return (
      <Screen>
        <div className="text-accent text-lg animate-pulse">Loading...</div>
      </Screen>
    );
  }

  // 4. fail-closed: залогинен, но не админ (или ошибка/пустой профиль).
  if (isAdmin !== true) {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <h1 className="text-2xl font-semibold text-white">Нет доступа</h1>
          <p className="text-white/60 max-w-sm">
            Этот аккаунт не имеет прав администратора.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            Выйти
          </button>
        </div>
      </Screen>
    );
  }

  // 5. Подтверждённый админ.
  return <AdminPanel />;
}
