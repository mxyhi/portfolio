import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { remarkCodeMeta } from "./src/lib/remark-code-meta";

const entrySchema = z.object({
    title: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
    summary: z.string(),
    image: z.string().optional(),
    content: z.string(),
});

const createMdxCollection = (name: string, directory: string) =>
  defineCollection({
    name,
    directory,
    include: "**/*.mdx",
    schema: entrySchema,
    transform: async (document, context) => {
      const mdx = await compileMDX(context, document, {
        remarkPlugins: [remarkGfm, remarkCodeMeta],
      });
      return {
        ...document,
        mdx,
      };
    },
  });

const posts = createMdxCollection("posts", "content/published");
// Keep examples as repo-only references. Live learn content comes from its own directory.
const learnPosts = createMdxCollection("learnPosts", "content/learn");

export default defineConfig({
  collections: [posts, learnPosts],
});
