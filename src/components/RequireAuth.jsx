import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AuthSessionContext = createContext(null);

export function useAuthSession() {
  return useContext(AuthSessionContext);
}

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setChecking(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(() => ({ session }), [session]);

  if (checking) {
    return (
      <div className="auth-loading">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return (
    <AuthSessionContext.Provider value={contextValue}>
      {children ?? <Outlet />}
    </AuthSessionContext.Provider>
  );
}
