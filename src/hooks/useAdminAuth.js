import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/libs/supabase';

const AUTH_CHECK_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMessage) {
  let timeoutId;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, AUTH_CHECK_TIMEOUT_MS);
    })
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isAuthCheckingRef = useRef(false);
  const authStateRef = useRef({
    user: null,
    isAdmin: false,
    initialized: false
  });

  const setAccessState = useCallback((nextUser, nextIsAdmin) => {
    authStateRef.current.user = nextUser;
    authStateRef.current.isAdmin = nextIsAdmin;
    setUser(nextUser);
    setIsAdmin(nextIsAdmin);
  }, []);

  const clearAccessState = useCallback(() => {
    setAccessState(null, false);
  }, [setAccessState]);

  const verifyAdminSession = useCallback(async (session, { recordLastLogin = false } = {}) => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      return {
        ok: false,
        status: 401,
        message: 'Session administrateur invalide.',
        user: null
      };
    }

    const response = await fetch('/api/admin/auth', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-record-last-login': recordLastLogin ? '1' : '0'
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message || payload?.error || 'Accès administrateur requis.',
        user: payload?.data?.user || session.user || null
      };
    }

    return {
      ok: Boolean(payload?.data?.isAdmin),
      status: response.status,
      message: payload?.message || '',
      user: payload?.data?.user || session.user || null
    };
  }, []);

  const checkUserAuth = useCallback(async (session = null, options = {}) => {
    // Prevent multiple simultaneous auth checks
    if (isAuthCheckingRef.current) {
      return;
    }

    const shouldBlockUi = options.blocking ?? !authStateRef.current.initialized;
    const hasKnownAccess = Boolean(authStateRef.current.user && authStateRef.current.isAdmin);

    try {
      isAuthCheckingRef.current = true;

      if (shouldBlockUi) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      // Check if supabase client is available
      if (!supabase) {
        setError('Configuration error: Supabase client not available');
        if (!hasKnownAccess) {
          clearAccessState();
        }
        return;
      }

      // Get session if not provided
      if (!session) {
        const { data: { session: currentSession }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          'Session check timed out'
        );

        if (sessionError) {
          throw new Error('Session error: ' + sessionError.message);
        }

        session = currentSession;
      }

      if (!session || !session.user) {
        clearAccessState();
        return;
      }

      const isSameUser = authStateRef.current.user?.id === session.user.id;

      // Keep the current page usable during background revalidation.
      if (!isSameUser || !authStateRef.current.user) {
        setAccessState(session.user, isSameUser ? authStateRef.current.isAdmin : false);
      }

      const verification = await withTimeout(
        verifyAdminSession(session, {
          recordLastLogin: Boolean(options.recordLastLogin)
        }),
        'Admin privilege check timed out'
      );

      if (!verification.ok) {
        const failureMessage = verification.message || 'Accès administrateur requis.';

        if (!shouldBlockUi && isSameUser && hasKnownAccess) {
          setError(`Erreur lors de la vérification des privilèges admin: ${failureMessage}`);
          return;
        }

        setError(`Erreur lors de la vérification des privilèges admin: ${failureMessage}`);
        setAccessState(session.user, false);
        return;
      }

      setAccessState(verification.user || session.user, true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const currentUser = authStateRef.current.user;
      const isSameUser = Boolean(session?.user && currentUser?.id === session.user.id);
      const shouldPreserveAccess = !shouldBlockUi && hasKnownAccess && (!session?.user || isSameUser);

      setError(`Erreur d'authentification: ${message}`);

      if (!shouldPreserveAccess) {
        clearAccessState();
      }
    } finally {
      authStateRef.current.initialized = true;
      isAuthCheckingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [clearAccessState, setAccessState, verifyAdminSession]);

  useEffect(() => {
    // Check if supabase client is available
    if (!supabase) {
      setError('Configuration error: Supabase client not available');
      setLoading(false);
      return;
    }

    // Get initial session
    void checkUserAuth(null, {
      blocking: true,
      recordLastLogin: true
    });

    // Keep auth fresh without blanking the page during background refreshes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Prevent multiple simultaneous auth checks
      if (isAuthCheckingRef.current) {
        return;
      }

      if (event === 'SIGNED_IN') {
        void checkUserAuth(session, {
          blocking: false,
          recordLastLogin: true
        });
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void checkUserAuth(session, {
          blocking: false,
          recordLastLogin: false
        });
      } else if (event === 'SIGNED_OUT') {
        clearAccessState();
        authStateRef.current.initialized = true;
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserAuth, clearAccessState]);

  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Auth state change will trigger checkUserAuth automatically
      return { success: true, data };
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email non confirmé. Vérifiez votre boîte email.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearAccessState();
      authStateRef.current.initialized = true;
      setLoading(false);
      setRefreshing(false);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    isAdmin,
    loading,
      refreshing,
      error,
      signInWithEmail,
      signOut,
      checkUserAuth
    };
}
