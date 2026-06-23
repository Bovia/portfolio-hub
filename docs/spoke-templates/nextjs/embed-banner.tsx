"use client";

/** Portfolio embed 演示提示条 — 复制到 src/components/user/embed-banner.tsx */

import { useUser } from "@/hooks/use-user";

type EmbedBannerProps = {
  onLogin: () => void;
};

export function EmbedBanner({ onLogin }: EmbedBannerProps) {
  const { embedMode, isGuestMode } = useUser();

  if (!embedMode || !isGuestMode) return null;

  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-2 border-b border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <span>演示模式 · 数据仅保存在本浏览器</span>
      <button
        type="button"
        onClick={onLogin}
        className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 font-semibold text-slate-700 hover:bg-slate-100"
      >
        登录云同步
      </button>
    </div>
  );
}
