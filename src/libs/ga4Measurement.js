function getMeasurementEndpoint() {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    return '';
  }

  return `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
}

function sanitizeServerPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function sendMeasurementEvent({
  clientId = '',
  eventName,
  eventParams = {},
  userId = ''
} = {}) {
  const endpoint = getMeasurementEndpoint();
  if (!endpoint || !eventName) {
    return { sent: false, reason: 'not_configured' };
  }

  const resolvedClientId = clientId || `server.${Date.now()}`;
  const payload = {
    client_id: resolvedClientId,
    events: [
      {
        name: eventName,
        params: sanitizeServerPayload(eventParams)
      }
    ]
  };

  if (userId) {
    payload.user_id = userId;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      sent: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      sent: false,
      reason: error?.message || 'request_failed'
    };
  }
}

