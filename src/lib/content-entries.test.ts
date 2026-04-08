import assert from "node:assert/strict";
import test from "node:test";
import {
  findContentEntryBySlug,
  getContentNeighbors,
  getPaginatedContentEntries,
  getContentSlug,
  getSortedContentEntries,
} from "./content-entries.ts";

const entries = [
  {
    _meta: { path: "systems-thinking.mdx" },
    title: "Systems Thinking",
    publishedAt: "2025-02-10",
    summary: "A note about systems.",
  },
  {
    _meta: { path: "learning-in-public.mdx" },
    title: "Learning in Public",
    publishedAt: "2026-01-05",
    summary: "A note about sharing progress.",
  },
  {
    _meta: { path: "deliberate-practice.mdx" },
    title: "Deliberate Practice",
    publishedAt: "2024-12-20",
    summary: "A note about practice.",
  },
] as const;

test("getContentSlug strips the mdx suffix from generated content paths", () => {
  assert.equal(getContentSlug(entries[0]), "systems-thinking");
});

test("getSortedContentEntries returns entries from newest to oldest", () => {
  const sortedEntries = getSortedContentEntries(entries);

  assert.deepEqual(
    sortedEntries.map((entry) => entry.title),
    ["Learning in Public", "Systems Thinking", "Deliberate Practice"]
  );
});

test("findContentEntryBySlug resolves an entry from its route slug", () => {
  const entry = findContentEntryBySlug(entries, "learning-in-public");

  assert.equal(entry?.title, "Learning in Public");
});

test("getPaginatedContentEntries clamps invalid page params and paginates sorted entries", () => {
  const pageOne = getPaginatedContentEntries(entries, "0", 2);
  assert.equal(pageOne.pagination.page, 1);
  assert.deepEqual(
    pageOne.items.map((entry) => entry.title),
    ["Learning in Public", "Systems Thinking"]
  );

  const pageTwo = getPaginatedContentEntries(entries, "99", 2);
  assert.equal(pageTwo.pagination.page, 2);
  assert.deepEqual(
    pageTwo.items.map((entry) => entry.title),
    ["Deliberate Practice"]
  );
});

test("getContentNeighbors keeps the current blog-style previous and next ordering", () => {
  const neighbors = getContentNeighbors(entries, "systems-thinking");

  assert.equal(neighbors.previousEntry?.title, "Learning in Public");
  assert.equal(neighbors.nextEntry?.title, "Deliberate Practice");
});
