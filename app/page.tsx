import { getAllPosts } from "@/lib/posts";
import { ProjectCard } from "@/components/ProjectCard";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* Hero 区域 */}
      <section className="mb-20 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-6 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          开放接受新项目
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
          用设计与代码，
          <br />
          <span className="text-gray-400">构建有温度的产品。</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          我相信真正好用的产品，藏在每一个被认真对待的细节里。
          从备考工具到养老服务，我做的每件事，都在尝试让技术离人更近一点。
        </p>
      </section>

      {/* 分割线 */}
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          精选作品
        </h2>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-sm text-gray-300">{posts.length} 个项目</span>
      </div>

      {/* 项目网格 */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无作品，敬请期待。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ProjectCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
