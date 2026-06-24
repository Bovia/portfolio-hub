import { PROJECTS } from "@/projects.config";
import { fetchPostMeta, fetchPost } from "./github";

/** 预览设备形态（Form Factor） */
export type PreviewDevice = "desktop" | "mobile" | "tablet" | "miniprogram";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  demoUrl?: string;
  githubUrl?: string;
  date?: string;
  /** 预览轮播的设备列表，如 [desktop, mobile, tablet, miniprogram] */
  devices?: PreviewDevice[];
  /** 是否在 Hub 展示，默认 true */
  published?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

/** portfolio.md 未写 published 时视为 true；仅 false 时隐藏 */
export function isPublished(meta: Pick<PostMeta, "published">): boolean {
  return meta.published !== false;
}

/** projects.config.ts 中已注册的 slug（含 published: false 的项目） */
export function getAllPostSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts: PostMeta[] = [];

  await Promise.all(
    PROJECTS.map(async (project) => {
      const meta = await fetchPostMeta(project.slug, project.repo, project.branch);
      if (meta) posts.push(meta);
    })
  );

  return posts
    .filter(isPublished)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return null;

  const post = await fetchPost(slug, project.repo, project.branch);
  if (!post || !isPublished(post)) return null;

  return post;
}
