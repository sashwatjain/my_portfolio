export async function getGithubProjects(username: string) {
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos`,
    {
      headers: {
        Accept: "application/vnd.github.mercy-preview+json",
      },
      next: { revalidate: 60 },
    }
  );

  if (!reposRes.ok) {
    throw new Error("Failed to fetch repos");
  }

  const repos = await reposRes.json();

  const projects = await Promise.all(
    repos
      .filter((repo: any) => !repo.fork)
      .map(async (repo: any) => {
        const base = `https://raw.githubusercontent.com/${username}/${repo.name}/main/`;

        // ✅ intro override
        let intro = repo.description || "";
        try {
          const introRes = await fetch(`${base}/intro.txt`);
          if (introRes.ok) {
            intro = await introRes.text();
          }
        } catch {}

        // ✅ tags override
        let tags: string[] = [];
        try {
          const tagsRes = await fetch(`${base}/tags.json`);
          if (tagsRes.ok) {
            tags = await tagsRes.json();
          }
        } catch {}

        return {
          ...repo, // 🔥 KEEP EVERYTHING
          customIntro: intro,
          customTags: tags,
          thumbnail: `${base}preview.gif`,
        };
      })
  );

  return projects;
}