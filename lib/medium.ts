export type MediumPost = {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
};


export async function getMediumPosts() {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@sashwatkjain",
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!data || !data.items) {
      console.error("Invalid Medium response:", data);
      return [];
    }

    // 🔥 fallback image generator based on title
    const getFallbackImage = (title: string) => {
      const t = title.toLowerCase();

      const base = "?w=800&h=400&fit=crop&q=80";

      if (t.includes("ai")) {
        return `https://images.unsplash.com/photo-1677442136019-21780ecad995${base}`;
      }

      if (t.includes("film") || t.includes("filmmaker")) {
        return `https://images.unsplash.com/photo-1505685296765-3a2736de412f${base}`;
      }

      if (t.includes("tech")) {
        return `https://images.unsplash.com/photo-1518770660439-4636190af475${base}`;
      }

      return `https://images.unsplash.com/photo-1492724441997-5dc865305da7${base}`;
    };

    return data.items.slice(0, 5).map((item: any) => {
      // 🧠 Try extracting real image (will fail in your case)
      const extractImage = (content: string) => {
        if (!content) return null;

        const matches = content.match(/<img[^>]+src="([^">]+)"/g);
        if (!matches) return null;

        for (const imgTag of matches) {
          const urlMatch = imgTag.match(/src="([^">]+)"/);
          const url = urlMatch?.[1];

          if (
            url &&
            !url.includes("medium.com/_/stat") &&
            url.includes("miro.medium.com")
          ) {
            return url.replace(/resize:\w+:\d+:\d+/, "resize:fit:800");
          }
        }

        return null;
      };

      const isValidImage = (url: string) => {
        return (
          url &&
          url.includes("miro.medium.com") &&
          !url.includes("medium.com/_/stat")
        );
      };

      const image =
        (isValidImage(item.thumbnail) && item.thumbnail) || // 🥇 best
        extractImage(item.description) ||                  // 🥈 fallback
        extractImage(item.content) ||                      // 🥉 fallback
        getFallbackImage(item.title);                      // 🧠 always works

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: image,
        description:
          item.description?.replace(/<[^>]+>/g, "").slice(0, 120) || "",
      };
    });
  } catch (err) {
    console.error("Medium fetch error:", err);
    return [];
  }
}