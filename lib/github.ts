import matter from "gray-matter";
import type { PostMeta, Post } from "./posts";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function rawUrl(repo: string, branch = "main") {
  return `https://raw.githubusercontent.com/${repo}/${branch}/portfolio.md`;
}

async function fetchMarkdown(repo: string, branch = "main"): Promise<string | null> {
  const url = rawUrl(repo, branch);
  const headers: HeadersInit = { Accept: "text/plain" };
  if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

  const isDev = process.env.NODE_ENV === "development";

  try {
    const res = await fetch(url, {
      headers,
      ...(isDev ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function fetchPostMeta(
  slug: string,
  repo: string,
  branch?: string
): Promise<PostMeta | null> {
  const raw = await fetchMarkdown(repo, branch);
  if (!raw) return null;

  const { data } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    tags: data.tags ?? [],
    thumbnail: data.thumbnail ?? "",
    demoUrl: data.demoUrl,
    githubUrl: data.githubUrl ?? `https://github.com/${repo}`,
    date: data.date,
  };
}

export async function fetchPost(
  slug: string,
  repo: string,
  branch?: string
): Promise<Post | null> {
  const raw = await fetchMarkdown(repo, branch);
  if (!raw) return null;

  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    tags: data.tags ?? [],
    thumbnail: data.thumbnail ?? "",
    demoUrl: data.demoUrl,
    githubUrl: data.githubUrl ?? `https://github.com/${repo}`,
    date: data.date,
    content,
  };
}
