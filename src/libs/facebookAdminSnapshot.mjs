const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

const SNAPSHOT_TTL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 50;

let snapshotCache = {
  expiresAt: 0,
  data: null
};

function buildWarning(key, message, level = 'warning') {
  return {
    key,
    message,
    level
  };
}

function normalizeWhitespace(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildMessagePreview(value, fallback) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return fallback;
  }

  return normalized.length > 160
    ? `${normalized.slice(0, 157)}...`
    : normalized;
}

function fixRelativeFacebookUrl(url, fallbackId) {
  if (!url && fallbackId) {
    return `https://www.facebook.com/watch/?v=${fallbackId}`;
  }

  if (!url) {
    return null;
  }

  if (url.startsWith('/')) {
    return `https://www.facebook.com${url}`;
  }

  return url;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Fetch error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

function readSummaryCount(node, isAvailable) {
  if (!isAvailable) {
    return null;
  }

  return typeof node?.summary?.total_count === 'number'
    ? node.summary.total_count
    : 0;
}

function readShareCount(node, isAvailable) {
  if (!isAvailable) {
    return null;
  }

  return typeof node?.count === 'number'
    ? node.count
    : 0;
}

function readVideoViews(insights, isAvailable) {
  if (!isAvailable) {
    return null;
  }

  const metric = (insights?.data || []).find((item) => item?.name === 'video_views');
  return typeof metric?.values?.[0]?.value === 'number'
    ? metric.values[0].value
    : 0;
}

function normalizePostItems(raw, availability = {}) {
  if (!Array.isArray(raw?.data)) {
    return [];
  }

  return raw.data.map((item) => ({
    id: item.id,
    kind: 'post',
    createdTime: item.created_time || null,
    permalinkUrl: item.permalink_url || null,
    messagePreview: buildMessagePreview(item.message, 'Publication Facebook sans texte.'),
    likes: readSummaryCount(item.likes, availability.likesAvailable),
    comments: readSummaryCount(item.comments, availability.commentsAvailable),
    shares: readShareCount(item.shares, availability.sharesAvailable),
    views: null
  }));
}

function normalizeReelItems(raw, availability = {}) {
  if (!Array.isArray(raw?.data)) {
    return [];
  }

  return raw.data.map((item) => ({
    id: item.id,
    kind: 'reel',
    createdTime: item.created_time || null,
    permalinkUrl: fixRelativeFacebookUrl(item.perma_link || item.permalink_url, item.id),
    messagePreview: buildMessagePreview(item.description, 'Reel Facebook sans description.'),
    likes: readSummaryCount(item.likes, availability.likesAvailable),
    comments: readSummaryCount(item.comments, availability.commentsAvailable),
    shares: readShareCount(item.shares, availability.sharesAvailable),
    views: readVideoViews(item.insights, availability.viewsAvailable)
  }));
}

function buildPostsUrl(limit, withEngagement = true) {
  const fields = withEngagement
    ? 'id,message,created_time,permalink_url,likes.summary(true).limit(0),comments.summary(true).limit(0),shares'
    : 'id,message,created_time,permalink_url';

  return `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
}

function buildReelsUrl(limit, profile = 'full') {
  let fields = 'id,created_time,permalink_url,perma_link,description';

  if (profile === 'full') {
    fields += ',insights.metric(video_views),likes.summary(true).limit(0),comments.summary(true).limit(0),shares';
  } else if (profile === 'views_and_likes') {
    fields += ',insights.metric(video_views),likes.summary(true).limit(0)';
  }

  return `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/video_reels?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;
}

async function fetchLatestPosts(limit) {
  try {
    const raw = await fetchJson(buildPostsUrl(limit, true));
    return {
      items: normalizePostItems(raw, {
        likesAvailable: true,
        commentsAvailable: true,
        sharesAvailable: true
      }),
      mode: 'full'
    };
  } catch (error) {
    try {
      const raw = await fetchJson(buildPostsUrl(limit, false));
      return {
        items: normalizePostItems(raw, {
          likesAvailable: false,
          commentsAvailable: false,
          sharesAvailable: false
        }),
        mode: 'fallback'
      };
    } catch (fallbackError) {
      return {
        items: [],
        mode: 'unavailable'
      };
    }
  }
}

async function fetchLatestReels(limit) {
  try {
    const raw = await fetchJson(buildReelsUrl(limit, 'full'));
    return {
      items: normalizeReelItems(raw, {
        likesAvailable: true,
        commentsAvailable: true,
        sharesAvailable: true,
        viewsAvailable: true
      }),
      mode: 'full'
    };
  } catch (error) {
    try {
      const raw = await fetchJson(buildReelsUrl(limit, 'views_and_likes'));
      return {
        items: normalizeReelItems(raw, {
          likesAvailable: true,
          commentsAvailable: false,
          sharesAvailable: false,
          viewsAvailable: true
        }),
        mode: 'fallback'
      };
    } catch (fallbackError) {
      try {
        const raw = await fetchJson(buildReelsUrl(limit, 'base'));
        return {
          items: normalizeReelItems(raw, {
            likesAvailable: false,
            commentsAvailable: false,
            sharesAvailable: false,
            viewsAvailable: false
          }),
          mode: 'fallback'
        };
      } catch (finalError) {
        return {
          items: [],
          mode: 'unavailable'
        };
      }
    }
  }
}

export async function fetchFacebookAdminSnapshot({ limit = DEFAULT_LIMIT } = {}) {
  const now = Date.now();
  if (snapshotCache.data && snapshotCache.expiresAt > now) {
    return snapshotCache.data;
  }

  const fetchedAt = new Date(now).toISOString();

  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    const unavailableSnapshot = {
      posts: [],
      reels: [],
      fetchedAt,
      warnings: [
        buildWarning(
          'facebook_metrics_unavailable',
          'La connexion Facebook n’est pas configurée côté serveur. Le dashboard continue sans snapshot Facebook.'
        )
      ]
    };

    snapshotCache = {
      expiresAt: now + SNAPSHOT_TTL_MS,
      data: unavailableSnapshot
    };

    return unavailableSnapshot;
  }

  const [postsResult, reelsResult] = await Promise.all([
    fetchLatestPosts(limit),
    fetchLatestReels(limit)
  ]);

  const warnings = [];
  if (postsResult.mode === 'unavailable' && reelsResult.mode === 'unavailable') {
    warnings.push(buildWarning(
      'facebook_metrics_unavailable',
      'Le snapshot Facebook est momentanément indisponible. Le dashboard continue de charger sans ces métriques.'
    ));
  } else if (postsResult.mode !== 'full' || reelsResult.mode !== 'full') {
    warnings.push(buildWarning(
      'facebook_metrics_partial',
      'Certaines métriques Facebook n’ont pas pu être récupérées. Les valeurs manquantes sont affichées en N/A.'
    ));
  }

  const snapshot = {
    posts: postsResult.items,
    reels: reelsResult.items,
    fetchedAt,
    warnings
  };

  snapshotCache = {
    expiresAt: now + SNAPSHOT_TTL_MS,
    data: snapshot
  };

  return snapshot;
}
