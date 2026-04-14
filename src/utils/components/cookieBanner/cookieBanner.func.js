'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { acceptCookieConsent, rejectCookieConsent } from '@/utils/consent/consent';
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

  const handleAccept = () => {
    acceptCookieConsent();
    setIsForcedOpen(false);
  };

  const handleReject = () => {
    rejectCookieConsent();
    setIsForcedOpen(false);
  };

  return {
    consentState,
    isOpen: !consentState.hasChoice || isForcedOpen,
    handleAccept,
    handleReject
  };
}
