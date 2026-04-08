import { DATA } from "@/data/resume";
import { getContentSlug, type ContentEntry } from "@/lib/content-entries";
import type { ContentSectionConfig } from "@/lib/content-sections";
import type { Metadata } from "next";

interface ContentMetadataEntry extends ContentEntry {
  title: string;
  summary: string;
  image?: string;
}

export function resolveContentImageUrl(image: string | undefined) {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//.test(image)) {
    return image;
  }

  return `${DATA.url}${image}`;
}

export function createCollectionMetadata(section: ContentSectionConfig): Metadata {
  return {
    title: section.title,
    description: section.description,
    openGraph: {
      title: section.title,
      description: section.description,
      url: `${DATA.url}${section.basePath}`,
      images: [`${DATA.url}${section.basePath}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: section.title,
      description: section.description,
      images: [`${DATA.url}${section.basePath}/opengraph-image`],
    },
  };
}

export function createEntryMetadata<T extends ContentMetadataEntry>(
  section: ContentSectionConfig,
  entry: T
): Metadata {
  const slug = getContentSlug(entry);
  const imageUrl =
    resolveContentImageUrl(entry.image) ??
    `${DATA.url}${section.basePath}/${slug}/opengraph-image`;

  return {
    title: entry.title,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: "article",
      publishedTime: entry.publishedAt,
      url: `${DATA.url}${section.basePath}/${slug}`,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
      images: [imageUrl],
    },
  };
}
