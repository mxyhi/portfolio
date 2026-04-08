import { normalizePage, paginate } from "./pagination.ts";

interface ContentEntryMeta {
  path: string;
}

export interface ContentEntry {
  _meta: ContentEntryMeta;
  publishedAt: string;
}

export function getContentSlug<T extends ContentEntry>(entry: T) {
  return entry._meta.path.replace(/\.mdx$/, "");
}

export function getSortedContentEntries<T extends ContentEntry>(
  entries: readonly T[]
) {
  return [...entries].sort((leftEntry, rightEntry) => {
    if (new Date(leftEntry.publishedAt) > new Date(rightEntry.publishedAt)) {
      return -1;
    }
    return 1;
  });
}

export function findContentEntryBySlug<T extends ContentEntry>(
  entries: readonly T[],
  slug: string
) {
  return entries.find((entry) => getContentSlug(entry) === slug);
}

export function getPaginatedContentEntries<T extends ContentEntry>(
  entries: readonly T[],
  pageParam: string | number | undefined,
  pageSize: number
) {
  const sortedEntries = getSortedContentEntries(entries);
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const currentPage = normalizePage(pageParam, totalPages);

  return paginate(sortedEntries, {
    page: currentPage,
    pageSize,
  });
}

export function getContentNeighbors<T extends ContentEntry>(
  entries: readonly T[],
  slug: string
) {
  const sortedEntries = getSortedContentEntries(entries);
  const currentIndex = sortedEntries.findIndex(
    (entry) => getContentSlug(entry) === slug
  );

  if (currentIndex === -1) {
    return {
      previousEntry: null,
      nextEntry: null,
    };
  }

  return {
    previousEntry: currentIndex > 0 ? sortedEntries[currentIndex - 1] : null,
    nextEntry:
      currentIndex < sortedEntries.length - 1
        ? sortedEntries[currentIndex + 1]
        : null,
  };
}
