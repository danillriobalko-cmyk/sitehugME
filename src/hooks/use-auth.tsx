import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /**
   * Признак администратора:
   *  - null  — ещё резолвится (профиль грузится) либо пользователь не залогинен;
   *  - false — точно НЕ админ (нет строки, ошибка запроса или is_admin !== true);
   *  - true  — подтверждённый администратор.
   * Гейт fail-closed: доступ открываем только при значении true.
   */
  isAdmin: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Подгружаем профиль и определяем is_admin при смене пользователя.
  const userId = user?.id ?? null;
  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setIsAdmin(null);
      return;
    }

    // Пока грузится профиль — состояние "неизвестно".
    setIsAdmin(null);

    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        // fail-closed: любая ошибка / пустой результат -> НЕ админ.
        const row = (data as { is_admin: boolean | null } | null) ?? null;
        setIsAdmin(!error && row?.is_admin === true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
