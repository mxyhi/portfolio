"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { buildClarityEventName, trackClarityEvent } from "@/lib/clarity";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="link"
      size="icon"
      className={cn(className)}
      onClick={() => {
        const nextTheme = theme === "dark" ? "light" : "dark";

        trackClarityEvent(buildClarityEventName("nav", "theme", nextTheme, "click"));
        setTheme(nextTheme);
      }}
    >
      <SunIcon className="h-full w-full" />
      <MoonIcon className="hidden h-full w-full" />
    </Button>
  );
}
