import { createContentOpenGraphImage } from "@/lib/content-opengraph";
import { CONTENT_SECTIONS } from "@/lib/content-sections";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export const alt = "Learn";

export default async function Image() {
  return createContentOpenGraphImage({
    title: CONTENT_SECTIONS.learn.title,
    description: CONTENT_SECTIONS.learn.description,
    alt,
  });
}
