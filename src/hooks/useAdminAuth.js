import { useState, useEffect } from 'react';
import { supabase } from '@/libs/supabase';

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 useAdminAuth hook initialized');
    
    // Check if supabase client is available
    if (!supabase) {
      console.error('❌ Supabase client not initialized - check environment variables');
      setError('Configuration error: Supabase client not available');
      setLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId;

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⏱️ Auth check timed out after 5 seconds');
        setLoading(false);
        setError('Authentication check timed out');
      }
    }, 5000);

    // Get initial session
    console.log('🔄 Calling checkUserAuth on mount...');
    checkUserAuth().finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    // Listen for auth changes
    console.log('👂 Setting up auth state change listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUserAuth(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = async (session = null) => {
    console.log('🔍 checkUserAuth called, session provided:', !!session);
    try {
      setLoading(true);
      setError(null);

      // Check if supabase client is available
      if (!supabase) {
        console.error('❌ Supabase client not initialized');
        setError('Configuration error: Supabase client not available');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      console.log('✅ Supabase client is available');

      // Get session if not provided
      if (!session) {
        console.log('📡 Fetching current session...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('❌ Error fetching session:', sessionError);
        }
        session = currentSession;
        console.log('✅ Session fetched:', session ? `User: ${session.user.email}` : 'No session');
      }

      if (!session) {
        console.log('🚫 No session found - user not logged in');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Set user
      console.log('👤 User found:', session.user.email);
      setUser(session.user);

      // Check if user is admin by querying admin_users table directly
      console.log('🔐 Checking admin privileges...');
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (adminError && adminError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Admin check error:', adminError);
        setError('Erreur lors de la vérification des privilèges admin');
        setIsAdmin(false);
      } else {
        const hasAdminRecord = !!adminData;
        console.log(hasAdminRecord ? '✅ User is admin' : '❌ User is not admin');
        setIsAdmin(hasAdminRecord);
        
        // Update last login if admin
        if (hasAdminRecord) {
          console.log('📝 Updating last login...');
          await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', session.user.email);
        }
      }
    } catch (err) {
      console.error('❌ Auth check error:', err);
      setError('Erreur d\'authentification');
      setUser(null);
      setIsAdmin(false);
    } finally {
      console.log('✅ Auth check complete, setting loading to false');
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