import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("theme provider does not render next-themes client script", async () => {
  const providerSource = await readFile(new URL("./theme-provider.tsx", import.meta.url), "utf8");
  const toggleSource = await readFile(new URL("./mode-toggle.tsx", import.meta.url), "utf8");
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(providerSource, /next-themes/);
  assert.doesNotMatch(toggleSource, /next-themes/);
  assert.doesNotMatch(layoutSource, /next\/script|<Script/);
  assert.match(toggleSource, /@\/components\/theme-provider/);
});

test("navbar keeps tooltip and dock rendering on the client", async () => {
  const navbarSource = await readFile(new URL("./navbar.tsx", import.meta.url), "utf8");

  assert.match(navbarSource, /^"use client";/);
});
