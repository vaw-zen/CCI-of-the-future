'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { acknowledgeCookieNotice } from '@/utils/consent/consent';
import { OPEN_COOKIE_PREFERENCES_EVENT } from '@/utils/consent/consent.constants';

export function useCookieBannerLogic() {
  const consentState = useCookieConsent();
  const [isForcedOpen, setIsForcedOpen] = useState(false);

  useEffect(() => {
    const handleOpenPreferences = () => {
      setIsForcedOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  const handleAcknowledge = () => {
    acknowledgeCookieNotice();
    setIsForcedOpen(false);
  };

  return {
    consentState,
    isOpen: isForcedOpen || (consentState.isReady && !consentState.hasAcknowledged),
    handleAcknowledge
  };
}
