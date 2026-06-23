import matter from "gray-matter";
import type { PostMeta, Post, PreviewDevice } from "./posts";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const VALID_DEVICES = new Set<PreviewDevice>(["desktop", "mobile", "tablet"]);

function rawUrl(repo: string, branch = "main") {
  return `https://raw.githubusercontent.com/${repo}/${branch}/portfolio.md`;
}

function parseDevices(data: Record<string, unknown>): PreviewDevice[] {
  if (Array.isArray(data.devices)) {
    return data.devices
      .map((d) => String(d).toLowerCase())
      .filter((d): d is PreviewDevice => VALID_DEVICES.has(d as PreviewDevice));
  }

  // 兼容旧字段 responsive: true → [desktop, mobile]
  const legacy =
    data.responsive === true || data.responsive === "true";
  if (legacy) return ["desktop", "mobile"];

  return [];
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

function parseFrontmatter(data: Record<string, unknown>, slug: string, repo: string) {
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    thumbnail: (data.thumbnail as string) ?? "",
    demoUrl: data.demoUrl as string | undefined,
    githubUrl: (data.githubUrl as string) ?? `https://github.com/${repo}`,
    date: data.date as string | undefined,
    devices: parseDevices(data),
  };
}

export async function fetchPostMeta(
  slug: string,
  repo: string,
  branch?: string
): Promise<PostMeta | null> {
  const raw = await fetchMarkdown(repo, branch);
  if (!raw) return null;

  const { data } = matter(raw);
  return parseFrontmatter(data, slug, repo);
}

export async function fetchPost(
  slug: string,
  repo: string,
  branch?: string
): Promise<Post | null> {
  const raw = await fetchMarkdown(repo, branch);
  if (!raw) return null;

  const { data, content } = matter(raw);
  return { ...parseFrontmatter(data, slug, repo), content };
}
