"use client";

import React, { useEffect, useState } from "react";

/**
 * Defers children rendering until client-side mount.
 * Prevents React Flow's `domNode === null` crash during SSR.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
