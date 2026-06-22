import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio — 用设计与代码，构建有温度的产品",
  description: "我做的每件事，都在尝试让技术离人更近一点。",
  openGraph: {
    title: "Portfolio",
    description: "我做的每件事，都在尝试让技术离人更近一点。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-white text-gray-900">
        {/* 顶部导航 */}
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a
              href="/"
              className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity"
            >
              Portfolio
            </a>
            <nav className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/" className="hover:text-gray-900 transition-colors">
                作品
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="pt-14">{children}</main>

        {/* 页脚 */}
        <footer className="mt-24 border-t border-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Portfolio Hub</span>
            <span>Built with Next.js · Deployed on Vercel</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
