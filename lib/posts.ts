import { PROJECTS } from "@/projects.config";
import { fetchPostMeta, fetchPost } from "./github";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  demoUrl?: string;
  githubUrl?: string;
  date?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPostSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const results = await Promise.all(
    PROJECTS.map((p) => fetchPostMeta(p.slug, p.repo, p.branch))
  );

  return results
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return null;
  return fetchPost(slug, project.repo, project.branch);
}
