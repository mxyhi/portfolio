"use client";

import { initializeClarity } from "@/lib/clarity";
import { useEffect, useRef } from "react";

export function ClarityAnalytics() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    initializeClarity();
  }, []);

  return null;
}
