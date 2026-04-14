'use client';

import { useCookieConsent } from '@/hooks/useCookieConsent';
import { openCookiePreferences } from '@/utils/consent/consent';

export function useCookiePreferencesCardLogic() {
  const consentState = useCookieConsent();

  const handleOpenBanner = () => {
    openCookiePreferences();
  };

  return {
    consentState,
    handleOpenBanner
  };
}
