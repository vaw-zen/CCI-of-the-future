'use client';

import { useState, useEffect } from 'react';
import Header from './header';

export default function ClientHeader({ roboto }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with the same height to prevent layout shift
    return <div style={{ height: '5vw' }} />;
  }

  return <Header roboto={roboto} />;
} 