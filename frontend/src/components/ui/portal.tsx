"use client";

import { useEffect, useState, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
