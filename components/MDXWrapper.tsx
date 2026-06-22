import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

const mdxComponents: MDXRemoteProps["components"] = {
  h1: (props) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-2" {...props} />
  ),
  p: (props) => (
    <p className="text-gray-600 leading-8 mb-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 text-gray-600" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-4 text-gray-600" {...props} />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-blue-200 pl-5 py-1 my-4 text-gray-500 italic bg-blue-50/50 rounded-r-lg"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-sm font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-gray-950 text-gray-100 rounded-xl p-5 my-5 overflow-x-auto text-sm font-mono leading-relaxed"
      {...props}
    />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-5">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="text-left font-semibold text-gray-700 pb-2 pr-4 border-b border-gray-200"
      {...props}
    />
  ),
  td: (props) => (
    <td className="py-2 pr-4 text-gray-600 border-b border-gray-100" {...props} />
  ),
  strong: (props) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  hr: () => <hr className="border-gray-200 my-8" />,
};

interface MDXWrapperProps {
  source: string;
}

export function MDXWrapper({ source }: MDXWrapperProps) {
  return (
    <div className="max-w-none">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
