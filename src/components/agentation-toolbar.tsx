"use client";

import dynamic from "next/dynamic";

const Agentation = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

export function AgentationToolbar() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Default to local-only annotations; opt into sync only when an endpoint is set.
  const endpoint = process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT;

  return endpoint ? <Agentation endpoint={endpoint} /> : <Agentation />;
}
