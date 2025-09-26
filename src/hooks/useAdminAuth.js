import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    checkUserAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUserAuth(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserAuth = async (session = null) => {
    try {
      setLoading(true);
      setError(null);

      // Get session if not provided
      if (!session) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        session = currentSession;
      }

      if (!session) {
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
        console.error('Admin check error:', adminError);
        setError('Erreur lors de la vérification des privilèges admin');
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
      console.error('Auth check error:', err);
      setError('Erreur d\'authentification');
      setUser(null);
      setIsAdmin(false);
    } finally {
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

      if (error) throw error;

      // Check admin status will be handled by the auth state change listener
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
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