export interface ContentSectionConfig {
  title: string;
  description: string;
  basePath: string;
  countLabel: string;
  emptyMessage: string;
  missingEntryTitle: string;
  missingEntryDescription: string;
  schemaType: "Article" | "BlogPosting";
}

export const CONTENT_SECTIONS = {
  blog: {
    title: "Blog",
    description: "Thoughts on software development, life, and more.",
    basePath: "/blog",
    countLabel: "posts",
    emptyMessage: "No blog posts yet. Check back soon!",
    missingEntryTitle: "Post Not Found",
    missingEntryDescription: "This blog post could not be found.",
    schemaType: "BlogPosting",
  },
  learn: {
    title: "Learn",
    description:
      "Learning notes on engineering systems, AI tooling, frontend craft, and better ways to build.",
    basePath: "/learn",
    countLabel: "notes",
    emptyMessage: "No learning notes yet. Check back soon!",
    missingEntryTitle: "Learning Note Not Found",
    missingEntryDescription: "This learning note could not be found.",
    schemaType: "Article",
  },
} as const satisfies Record<string, ContentSectionConfig>;
