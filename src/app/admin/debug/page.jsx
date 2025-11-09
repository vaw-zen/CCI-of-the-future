'use client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect, useState } from 'react';

export default function AdminDebugPage() {
  const { user, isAdmin, loading, error } = useAdminAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      } : null,
      isAdmin,
      loading,
      error,
      localStorage: typeof window !== 'undefined' ? {
        supabaseAuth: localStorage.getItem('supabase.auth.token'),
        hasSupabaseSession: !!localStorage.getItem('supabase.auth.token')
      } : {},
      location: typeof window !== 'undefined' ? window.location.href : 'server'
    };
    
    setDebugInfo(info);
    console.log('Admin Debug Info:', info);
  }, [user, isAdmin, loading, error]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Auth Debug</h1>
      
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Quick Status</h3>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
      </div>

      <div style={{ backgroundColor: loading ? '#fff3cd' : isAdmin ? '#d1edff' : '#f8d7da', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Auth State</h3>
        {loading && <p>🔄 Authentication is still loading...</p>}
        {!loading && !user && <p>❌ No user logged in</p>}
        {!loading && user && !isAdmin && <p>⚠️ User logged in but not admin</p>}
        {!loading && user && isAdmin && <p>✅ Admin user authenticated successfully</p>}
        {error && <p>🚨 Error: {error}</p>}
      </div>

      <details style={{ marginBottom: '20px' }}>
        <summary style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
          <strong>Full Debug Info (Click to expand)</strong>
        </summary>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '15px', overflow: 'auto', fontSize: '12px', marginTop: '10px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      <div style={{ marginTop: '20px' }}>
        <h3>Actions</h3>
        <button 
          onClick={() => window.location.href = '/admin/devis'}
          style={{ marginRight: '10px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Go to Devis Page
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}