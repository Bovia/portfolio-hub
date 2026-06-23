import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DemoPreview } from "@/components/DemoPreview";
import { MDXWrapper } from "@/components/MDXWrapper";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Portfolio Hub`,
    description: post.description,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 min-w-0 overflow-x-hidden">
      {/* 返回按钮 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:-translate-x-0.5"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        所有作品
      </Link>

      {/* 页面标题区 */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal bg-gray-100 text-gray-500 border-0 rounded-full px-3 py-1"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          {post.title}
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
          {post.description}
        </p>
      </div>

      {/* 主体布局：内容 + 预览 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 min-w-0">
        {/* 左侧：MDX 文章内容 */}
        <article className="min-w-0">
          <MDXWrapper source={post.content} />
        </article>

        {/* 右侧：Demo 预览，固定占一半宽度 */}
        <aside className="xl:sticky xl:top-20 self-start w-full min-w-0 max-w-full overflow-hidden space-y-5">
          {/* Demo 预览窗口 */}
          {post.demoUrl && (
            <DemoPreview
              demoUrl={post.demoUrl}
              title={post.title}
              devices={post.devices}
            />
          )}

          {/* 操作链接 */}
          <div className="flex flex-col gap-3">
            {post.demoUrl && (
              <a
                href={post.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                访问在线演示
              </a>
            )}
            {post.githubUrl && (
              <a
                href={post.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                查看源码
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
