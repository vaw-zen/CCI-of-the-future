import { supabase } from '@/libs/supabase';

async function getAccessToken() {
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  const accessToken = data?.session?.access_token;
  if (!accessToken) {
    throw new Error('No active admin session');
  }

  return accessToken;
}

export async function updateLeadStatus(kind, id, payload) {
  const accessToken = await getAccessToken();

  const response = await fetch(`/api/admin/leads/${kind}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'Lead status update failed');
  }

  return result.data;
}
