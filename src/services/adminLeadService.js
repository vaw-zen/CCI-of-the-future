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

export async function getWhatsAppDirectLeads({
  leadStatus,
  businessLine,
  phone,
  leadOwner,
  dateFrom,
  dateTo,
  leadId,
  limit
} = {}) {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams();

  if (leadStatus) {
    params.set('leadStatus', leadStatus);
  }

  if (businessLine) {
    params.set('businessLine', businessLine);
  }

  if (phone) {
    params.set('phone', phone);
  }

  if (leadOwner) {
    params.set('leadOwner', leadOwner);
  }

  if (dateFrom) {
    params.set('dateFrom', dateFrom);
  }

  if (dateTo) {
    params.set('dateTo', dateTo);
  }

  if (leadId) {
    params.set('leadId', leadId);
  }

  if (limit) {
    params.set('limit', String(limit));
  }

  const response = await fetch(`/api/admin/whatsapp-leads${params.toString() ? `?${params.toString()}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'WhatsApp leads load failed');
  }

  return result.data;
}

export async function createWhatsAppDirectLead(payload) {
  const accessToken = await getAccessToken();

  const response = await fetch('/api/admin/whatsapp-leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'WhatsApp lead creation failed');
  }

  return result.data;
}

export async function getWhatsAppIntents({
  dateFrom,
  dateTo,
  limit
} = {}) {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams();

  if (dateFrom) {
    params.set('dateFrom', dateFrom);
  }

  if (dateTo) {
    params.set('dateTo', dateTo);
  }

  if (limit) {
    params.set('limit', String(limit));
  }

  const response = await fetch(`/api/admin/whatsapp-intents${params.toString() ? `?${params.toString()}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'WhatsApp intents load failed');
  }

  return result.data;
}

export async function convertWhatsAppIntentToLead(payload) {
  const accessToken = await getAccessToken();

  const response = await fetch('/api/admin/whatsapp-intents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'WhatsApp intent conversion failed');
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
