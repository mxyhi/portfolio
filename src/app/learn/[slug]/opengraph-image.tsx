import { createContentOpenGraphImage } from "@/lib/content-opengraph";
import { findContentEntryBySlug } from "@/lib/content-entries";
import { allLearnPosts } from "content-collections";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export const alt = "Learning Note";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findContentEntryBySlug(allLearnPosts, slug);

  if (!post) {
    return createContentOpenGraphImage({
      title: "Post Not Found",
      description: "This learning note could not be found.",
      alt,
    });
  }

  return createContentOpenGraphImage({
    title: post.title,
    description: post.summary,
    alt: post.title,
    publishedAt: post.publishedAt,
  });
}
