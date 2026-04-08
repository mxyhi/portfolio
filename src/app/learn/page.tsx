import { ContentListPage } from "@/components/content/content-list-page";
import { createCollectionMetadata } from "@/lib/content-metadata";
import { CONTENT_SECTIONS } from "@/lib/content-sections";
import { allLearnPosts } from "content-collections";

export const metadata = createCollectionMetadata(CONTENT_SECTIONS.learn);

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  return (
    <ContentListPage
      entries={allLearnPosts}
      title={CONTENT_SECTIONS.learn.title}
      description={CONTENT_SECTIONS.learn.description}
      countLabel={CONTENT_SECTIONS.learn.countLabel}
      emptyMessage={CONTENT_SECTIONS.learn.emptyMessage}
      basePath={CONTENT_SECTIONS.learn.basePath}
      pageParam={page}
    />
  );
}
