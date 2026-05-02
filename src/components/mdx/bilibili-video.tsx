interface BilibiliVideoProps {
  bvid: string;
  title: string;
  part?: number;
  startTime?: number;
  className?: string;
}

export function BilibiliVideo({
  bvid,
  title,
  part = 1,
  startTime,
  className = "",
}: BilibiliVideoProps) {
  const src = createBilibiliPlayerUrl({ bvid, part, startTime });

  return (
    <figure className={`my-6 ${className}`}>
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
        <iframe
          src={src}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {title}
      </figcaption>
    </figure>
  );
}

function createBilibiliPlayerUrl({
  bvid,
  part,
  startTime,
}: Pick<BilibiliVideoProps, "bvid" | "part" | "startTime">) {
  const params = new URLSearchParams({
    bvid,
    p: String(part ?? 1),
    autoplay: "0",
    danmaku: "0",
  });

  if (startTime !== undefined) {
    params.set("t", String(startTime));
  }

  return `https://player.bilibili.com/player.html?${params.toString()}`;
}
