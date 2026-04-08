import { ContentListPage } from "@/components/content/content-list-page";
import { createCollectionMetadata } from "@/lib/content-metadata";
import { CONTENT_SECTIONS } from "@/lib/content-sections";
import { allPosts } from "content-collections";

export const metadata = createCollectionMetadata(CONTENT_SECTIONS.blog);

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  return (
    <ContentListPage
      entries={allPosts}
      title={CONTENT_SECTIONS.blog.title}
      description={CONTENT_SECTIONS.blog.description}
      countLabel={CONTENT_SECTIONS.blog.countLabel}
      emptyMessage={CONTENT_SECTIONS.blog.emptyMessage}
      basePath={CONTENT_SECTIONS.blog.basePath}
      pageParam={page}
    />
  );
}
