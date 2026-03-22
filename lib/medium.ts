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

    // 🛑 safety check
    if (!data || !data.items) {
      console.error("Invalid Medium response:", data);
      return [];
    }

    return data.items.slice(0, 5).map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      thumbnail:
        item.thumbnail ||
        item.enclosure?.link ||
        "/medium-emblem.png",
      description:
        item.description?.replace(/<[^>]+>/g, "").slice(0, 120) || "",
    }));
  } catch (err) {
    console.error("Medium fetch error:", err);
    return [];
  }
}