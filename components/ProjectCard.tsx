import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/posts";

interface ProjectCardProps {
  post: PostMeta;
}

export function ProjectCard({ post }: ProjectCardProps) {
  return (
    <Link href={`/projects/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        {/* 缩略图区域 */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-500">
                  {post.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {post.description}
          </p>

          {/* 技术栈标签 */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 rounded-full px-2.5 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > 4 && (
              <Badge
                variant="secondary"
                className="text-xs font-normal bg-gray-100 text-gray-400 border-0 rounded-full px-2.5 py-0.5"
              >
                +{post.tags.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* 底部箭头指示 */}
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  );
}
