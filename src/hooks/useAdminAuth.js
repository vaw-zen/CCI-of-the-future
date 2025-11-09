import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  useEffect(() => {
    // Check if supabase client is available
    if (!supabase) {
      setError('Configuration error: Supabase client not available');
      setLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId;

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        setError('Authentication check timed out');
      }
    }, 10000);

    // Get initial session
    checkUserAuth().finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    // Listen for auth changes with debouncing
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent multiple simultaneous auth checks
      if (isAuthChecking) {
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUserAuth(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = async (session = null) => {
    // Prevent multiple simultaneous auth checks
    if (isAuthChecking) {
      return;
    }

    try {
      setIsAuthChecking(true);
      setLoading(true);
      setError(null);

      // Check if supabase client is available
      if (!supabase) {
        setError('Configuration error: Supabase client not available');
        setUser(null);
        setIsAdmin(false);
        return;
      }

      // Get session if not provided
      if (!session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError('Session error: ' + sessionError.message);
          setUser(null);
          setIsAdmin(false);
          return;
        }
        session = currentSession;
      }

      if (!session || !session.user) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      // Set user
      setUser(session.user);

      // Check if user is admin by querying admin_users table directly
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (adminError && adminError.code !== 'PGRST116') { // PGRST116 = no rows returned
        setError('Erreur lors de la vérification des privilèges admin: ' + adminError.message);
        setIsAdmin(false);
      } else {
        const hasAdminRecord = !!adminData;
        setIsAdmin(hasAdminRecord);
        
        // Update last login if admin
        if (hasAdminRecord) {
          await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', session.user.email);
        }
      }
    } catch (err) {
      setError('Erreur d\'authentification: ' + err.message);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsAuthChecking(false);
      setLoading(false);
    }
  };

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
      
      setUser(null);
      setIsAdmin(false);
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
    error,
    signInWithEmail,
    signOut,
    checkUserAuth
  };
}