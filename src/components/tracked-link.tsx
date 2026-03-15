"use client";

import { trackClarityEvent } from "@/lib/clarity";
import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  eventName?: string;
  stopPropagation?: boolean;
}

export function TrackedLink({
  eventName,
  stopPropagation = false,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    onClick?.(event);

    if (event.defaultPrevented || !eventName) {
      return;
    }

    trackClarityEvent(eventName);
  };

  return <Link {...props} onClick={handleClick} />;
}
