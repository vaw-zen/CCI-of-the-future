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

async function fetchAdminJson(path, {
  method = 'GET',
  body,
  signal
} = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${accessToken}`
    },
    body: body ? JSON.stringify(body) : undefined,
    signal
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || 'Admin request failed');
  }

  return result;
}

export async function updateLeadStatus(kind, id, payload) {
  const result = await fetchAdminJson(`/api/admin/leads/${kind}/${id}/status`, {
    method: 'PATCH',
    body: payload
  });

  return result.data;
}

export async function updateLeadAttribution(kind, id, payload) {
  const result = await fetchAdminJson(`/api/admin/leads/${kind}/${id}/attribution`, {
    method: 'PATCH',
    body: payload
  });

  return result.data;
}

export async function updateLeadOperations(kind, id, payload) {
  const result = await fetchAdminJson(`/api/admin/leads/${kind}/${id}/ops`, {
    method: 'PATCH',
    body: payload
  });

  return result.data;
}

export async function getAdminLeadSummaries(kind, {
  limit,
  cursor,
  signal,
  ...filters
} = {}) {
  const params = new URLSearchParams();

  params.set('kind', kind);
  if (limit) {
    params.set('limit', String(limit));
  }

  if (cursor !== undefined && cursor !== null && cursor !== '') {
    params.set('cursor', String(cursor));
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  const result = await fetchAdminJson(`/api/admin/leads?${params.toString()}`, {
    signal
  });

  return {
    rows: result.data || [],
    nextCursor: result.details?.nextCursor || null,
    hasMore: Boolean(result.details?.hasMore)
  };
}

export async function getAdminLeadDetail(kind, id, { signal } = {}) {
  const result = await fetchAdminJson(`/api/admin/leads/${kind}/${id}`, {
    signal
  });

  return result.data;
}

export async function getWhatsAppDirectLeads(options = {}) {
  const result = await getAdminLeadSummaries('whatsapp', options);
  return result.rows;
}

export async function createWhatsAppDirectLead(payload) {
  const result = await fetchAdminJson('/api/admin/whatsapp-leads', {
    method: 'POST',
    body: payload
  });

  return result.data;
}

export async function getWhatsAppIntents({
  dateFrom,
  dateTo,
  limit,
  signal
} = {}) {
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

  const result = await fetchAdminJson(`/api/admin/whatsapp-intents${params.toString() ? `?${params.toString()}` : ''}`, {
    signal
  });

  return result.data;
}

export async function convertWhatsAppIntentToLead(payload) {
  const result = await fetchAdminJson('/api/admin/whatsapp-intents', {
    method: 'POST',
    body: payload
  });

  return result.data;
}

export async function getAdminDashboardData({
  from,
  to,
  businessLine,
  service,
  sourceClass,
  device,
  pageType,
  sections,
  signal
} = {}) {
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

  if (Array.isArray(sections) && sections.length > 0) {
    params.set('sections', sections.join(','));
  } else if (typeof sections === 'string' && sections.trim()) {
    params.set('sections', sections);
  }

  const result = await fetchAdminJson(`/api/admin/dashboard${params.toString() ? `?${params.toString()}` : ''}`, {
    signal
  });

  return result.data;
}
