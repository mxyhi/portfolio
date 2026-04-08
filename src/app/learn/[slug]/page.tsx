import { ContentDetailPage } from "@/components/content/content-detail-page";
import { createEntryMetadata } from "@/lib/content-metadata";
import { findContentEntryBySlug, getContentSlug } from "@/lib/content-entries";
import { CONTENT_SECTIONS } from "@/lib/content-sections";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allLearnPosts } from "content-collections";

export async function generateStaticParams() {
  return allLearnPosts.map((post) => ({
    slug: getContentSlug(post),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = findContentEntryBySlug(allLearnPosts, slug);

  if (!post) {
    return undefined;
  }

  return createEntryMetadata(CONTENT_SECTIONS.learn, post);
}

export default async function LearnPostPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const post = findContentEntryBySlug(allLearnPosts, slug);

  if (!post) {
    notFound();
  }

  return (
    <ContentDetailPage
      entry={post}
      entries={allLearnPosts}
      section={CONTENT_SECTIONS.learn}
    />
  );
}
