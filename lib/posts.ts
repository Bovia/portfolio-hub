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
  /** 响应式：兼容移动端 + 桌面端，开启预览双模式切换 */
  responsive?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

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

  return posts.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return null;
  return fetchPost(slug, project.repo, project.branch);
}
