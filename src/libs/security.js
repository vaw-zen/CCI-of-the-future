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

function getAllowedHosts() {
  const hosts = new Set(['localhost', '127.0.0.1', '::1']);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      hosts.add(new URL(siteUrl).hostname);
    } catch (error) {
      // Ignore invalid configuration here; route handlers still validate envs.
    }
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    hosts.add(vercelUrl.replace(/^https?:\/\//, '').split('/')[0]);
  }

  return hosts;
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
    return NextResponse.json({
      status: 'invalid_origin',
      message: 'Origine de requête invalide.',
      data: null,
      details: {
        failureType: 'invalid_origin'
      }
    }, { status: 403 });
  }

  if (getAllowedHosts().has(originHostname)) {
    return null;
  }

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
