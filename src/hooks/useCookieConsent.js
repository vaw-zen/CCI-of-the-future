'use client';

import { useEffect, useState } from 'react';
import { CONSENT_CHANGE_EVENT } from '@/utils/consent/consent.constants';
import { getCookieConsentState } from '@/utils/consent/consent';

export function useCookieConsent() {
  const [consentState, setConsentState] = useState({
    eligible: false,
    status: '',
    hasChoice: false,
    accepted: false,
    rejected: false
  });

  useEffect(() => {
    const syncConsentState = () => {
      setConsentState(getCookieConsentState());
    };

    syncConsentState();
    window.addEventListener(CONSENT_CHANGE_EVENT, syncConsentState);

    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, syncConsentState);
    };
  }, []);

  return consentState;
}
