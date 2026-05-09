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

export async function updateLeadAttribution(kind, id, payload) {
  const accessToken = await getAccessToken();

  const response = await fetch(`/api/admin/leads/${kind}/${id}/attribution`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'Lead attribution update failed');
  }

  return result.data;
}

export async function updateLeadOperations(kind, id, payload) {
  const accessToken = await getAccessToken();

  const response = await fetch(`/api/admin/leads/${kind}/${id}/ops`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'Lead operations update failed');
  }

  return result.data;
}

export async function getAdminDashboardData({
  from,
  to,
  businessLine,
  service,
  sourceClass,
  device,
  pageType
} = {}) {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams();

  if (from) {
    params.set('from', from);
  }

  if (to) {
    params.set('to', to);
  }

  if (businessLine) {
    params.set('businessLine', businessLine);
  }

  if (service) {
    params.set('service', service);
  }

  if (sourceClass) {
    params.set('sourceClass', sourceClass);
  }

  if (device) {
    params.set('device', device);
  }

  if (pageType) {
    params.set('pageType', pageType);
  }

  const response = await fetch(`/api/admin/dashboard${params.toString() ? `?${params.toString()}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'Dashboard load failed');
  }

  return result.data;
}
