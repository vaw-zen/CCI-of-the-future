export const TRACKING_ELIGIBLE_COOKIE_NAME = 'cci_tracking_eligible';
export const COOKIE_CONSENT_COOKIE_NAME = 'cci_cookie_consent';
export const COOKIE_CONSENT_ACCEPTED = 'accepted';
export const COOKIE_CONSENT_REJECTED = 'rejected';
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export const CONSENT_CHANGE_EVENT = 'cci:cookie-consent-change';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'cci:cookie-preferences-open';

export const SESSION_ATTRIBUTION_KEY = 'cci_session_attribution';
export const UTM_SESSION_KEY = 'utm_data';
export const UTM_HISTORY_KEY = 'utm_history';
export const FACEBOOK_REFERRALS_KEY = 'fb_referrals';

export const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

export const GTAG_LOADER_ID = 'gtag-loader';
export const GTAG_INIT_ID = 'gtag-init';
export const GTAG_CONVERSION_ID = 'gtag-conversion';
export const GTM_LOADER_ID = 'gtm-loader';
export const FACEBOOK_PIXEL_SCRIPT_ID = 'facebook-pixel-loader';
