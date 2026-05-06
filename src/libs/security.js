import crypto from 'crypto';
import { NextResponse } from 'next/server';

const buckets = new Map();

function getBucketKey(key, windowMs) {
  return `${key}:${Math.floor(Date.now() / windowMs)}`;
}

function cleanupBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || request.headers.get('x-vercel-forwarded-for')
    || 'unknown';
}

export function hashRequestValue(value = '') {
  if (!value) {
    return null;
  }

  return crypto.createHash('sha256').update(value).digest('hex');
}

export function rateLimitRequest(request, {
  scope,
  limit = 30,
  windowMs = 60_000
} = {}) {
  cleanupBuckets();

  const ip = getClientIp(request);
  const bucketKey = getBucketKey(`${scope}:${ip}`, windowMs);
  const currentBucket = buckets.get(bucketKey) || {
    count: 0,
    expiresAt: Date.now() + windowMs
  };

  currentBucket.count += 1;
  buckets.set(bucketKey, currentBucket);

  if (currentBucket.count <= limit) {
    return null;
  }

  return NextResponse.json({
    status: 'rate_limited',
    message: 'Trop de tentatives. Veuillez réessayer dans quelques instants.',
    data: null,
    details: {
      failureType: 'rate_limited'
    }
  }, {
    status: 429,
    headers: {
      'Retry-After': String(Math.ceil((currentBucket.expiresAt - Date.now()) / 1000))
    }
  });
}

function normalizeHostname(hostname = '') {
  return String(hostname)
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');
}

function extractHostname(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }

  try {
    return normalizeHostname(new URL(rawValue).hostname);
  } catch (error) {
    try {
      return normalizeHostname(new URL(`https://${rawValue}`).hostname);
    } catch (fallbackError) {
      return '';
    }
  }
}

function addAllowedHost(hosts, hostname, { includeWwwVariant = false } = {}) {
  const normalizedHostname = normalizeHostname(hostname);
  if (!normalizedHostname) {
    return;
  }

  hosts.add(normalizedHostname);

  if (
    includeWwwVariant
    && normalizedHostname !== 'localhost'
    && normalizedHostname !== '127.0.0.1'
    && normalizedHostname !== '::1'
    && !/^\d+\.\d+\.\d+\.\d+$/.test(normalizedHostname)
  ) {
    hosts.add(normalizedHostname.startsWith('www.')
      ? normalizedHostname.slice(4)
      : `www.${normalizedHostname}`);
  }
}

function addAllowedOriginList(hosts, value = '') {
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      addAllowedHost(hosts, extractHostname(entry));
    });
}

function getAllowedHosts() {
  const hosts = new Set();

  ['localhost', '127.0.0.1', '::1'].forEach((hostname) => {
    addAllowedHost(hosts, hostname);
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    addAllowedHost(hosts, extractHostname(siteUrl), { includeWwwVariant: true });
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    addAllowedHost(hosts, extractHostname(vercelUrl));
  }

  addAllowedOriginList(hosts, process.env.ADMIN_ALLOWED_ORIGINS);

  return hosts;
}

function logRejectedOrigin(request, originHostname, allowedHosts) {
  console.warn('[security] mutation origin rejected:', {
    path: request.nextUrl?.pathname,
    originHostname,
    allowedHosts: Array.from(allowedHosts).sort(),
    ip: getClientIp(request)
  });
}

export function validateMutationOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }

  let originHostname;
  try {
    originHostname = new URL(origin).hostname;
  } catch (error) {
    console.warn('[security] invalid mutation origin header:', {
      path: request.nextUrl?.pathname,
      originHeaderLength: origin.length,
      ip: getClientIp(request)
    });

    return NextResponse.json({
      status: 'invalid_origin',
      message: 'Origine de requête invalide.',
      data: null,
      details: {
        failureType: 'invalid_origin'
      }
    }, { status: 403 });
  }

  const allowedHosts = getAllowedHosts();
  const normalizedOriginHostname = normalizeHostname(originHostname);
  if (allowedHosts.has(normalizedOriginHostname)) {
    return null;
  }

  logRejectedOrigin(request, normalizedOriginHostname, allowedHosts);

  return NextResponse.json({
    status: 'invalid_origin',
    message: 'Origine de requête non autorisée.',
    data: null,
    details: {
      failureType: 'invalid_origin'
    }
  }, { status: 403 });
}

export function guardMutationRequest(request, rateLimitOptions) {
  return validateMutationOrigin(request) || rateLimitRequest(request, rateLimitOptions);
}
