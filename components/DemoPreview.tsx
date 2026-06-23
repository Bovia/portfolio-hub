"use client";

import { useEffect, useRef, useState } from "react";

type ViewMode = "desktop" | "mobile";
/** dark = 深灰图标（浅色背景）；light = 白色图标（深色背景） */
type StatusBarTheme = "dark" | "light";
/** auto = mix-blend 随内容自适应；dark/light = 嵌入页 postMessage 显式指定 */
type StatusBarMode = "auto" | StatusBarTheme;

interface DemoPreviewProps {
  demoUrl: string;
  title: string;
  responsive?: boolean;
  intervalMs?: number;
}

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const PHONE_ASPECT = 852 / 393;
const PHONE_REF_WIDTH = 393;
const PHONE_MAX_WIDTH = 320;

function StatusIcons({ theme, auto }: { theme: StatusBarTheme; auto?: boolean }) {
  const strokeOpacity = auto ? 1 : theme === "dark" ? 0.35 : 0.45;

  return (
    <div className={`flex items-center gap-1.5 ${auto ? "opacity-90" : ""}`}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
        <rect x="0" y="6" width="3" height="5" rx="0.5" />
        <rect x="4.5" y="4" width="3" height="7" rx="0.5" />
        <rect x="9" y="2" width="3" height="9" rx="0.5" />
        <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" />
      </svg>
      <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor">
        <path d="M7 2.2C5.1 2.2 3.3 2.9 1.9 4.1L0 2.1C1.9 0.4 4.4-.6 7-.6s5.1 1 7 2.7l-1.9 2C10.7 2.9 8.9 2.2 7 2.2zm0 3.5c-1.2 0-2.3.5-3.1 1.3L2 4.8C3.3 3.5 5.1 2.8 7 2.8s3.7.7 5 2l-1.9 1.9c-.8-.8-1.9-1.3-3.1-1.3zm0 3.5c-.7 0-1.3.3-1.8.7L7 8.4l1.8-1.8c-.5-.4-1.1-.7-1.8-.7z" />
      </svg>
      <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
        <rect
          x="0.5"
          y="0.5"
          width="18"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeOpacity={strokeOpacity}
        />
        <rect x="2" y="2" width="14" height="7" rx="1" fill="currentColor" />
        <path
          d="M20 4.5v2a1.5 1.5 0 000-3v3z"
          fill="currentColor"
          fillOpacity={strokeOpacity}
        />
      </svg>
    </div>
  );
}

function IPhoneStatusBar({
  mode,
  phoneWidth,
}: {
  mode: StatusBarMode;
  phoneWidth: number;
}) {
  const scale = phoneWidth / PHONE_REF_WIDTH;
  const islandW = Math.round(108 * scale);
  const islandH = Math.round(30 * scale);
  const auto = mode === "auto";
  const fgClass = auto
    ? "text-white mix-blend-difference"
    : mode === "dark"
      ? "text-[#1d1d1f]"
      : "text-white";

  return (
    <>
      <div
        className="absolute left-1/2 top-[10px] -translate-x-1/2 z-30 pointer-events-none"
        style={{ width: islandW, height: islandH }}
      >
        <div className="w-full h-full bg-black rounded-full ring-1 ring-white/10" />
      </div>
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-end justify-between px-5 pb-1 h-11 pointer-events-none transition-colors duration-500 ${fgClass}`}
      >
        <span className="text-[12px] font-semibold tracking-tight">9:41</span>
        <StatusIcons theme={mode === "auto" ? "light" : mode} auto={auto} />
      </div>
    </>
  );
}

function HomeIndicator({
  mode,
  phoneWidth,
}: {
  mode: StatusBarMode;
  phoneWidth: number;
}) {
  const barW = Math.round(110 * (phoneWidth / PHONE_REF_WIDTH));
  const auto = mode === "auto";

  return (
    <div
      className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-[4px] rounded-full z-20 pointer-events-none transition-colors duration-500 ${
        auto
          ? "bg-white mix-blend-difference"
          : mode === "dark"
            ? "bg-black/30"
            : "bg-white/55"
      }`}
      style={{ width: barW }}
    />
  );
}

export function DemoPreview({
  demoUrl,
  title,
  responsive = false,
  intervalMs = 4500,
}: DemoPreviewProps) {
  const [mode, setMode] = useState<ViewMode>("desktop");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== "undefined"
      ? Math.min(window.innerWidth - 32, 960)
      : 360
  );
  const [statusBarMode, setStatusBarMode] = useState<StatusBarMode>("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = mode === "mobile";
  const hostname = demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const transitionClass = reducedMotion
    ? ""
    : "transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]";

  const desktopScale = containerWidth / DESKTOP_VIEWPORT.width;
  const desktopDisplayHeight = DESKTOP_VIEWPORT.height * desktopScale;

  const horizontalPadding = containerWidth < 400 ? 16 : 32;
  const availableWidth = Math.max(containerWidth - horizontalPadding, 0);
  let phoneWidth = Math.min(
    PHONE_MAX_WIDTH,
    Math.floor(availableWidth * 0.92)
  );
  let bezel = Math.round(10 * (phoneWidth / PHONE_REF_WIDTH));
  while (phoneWidth > 200 && phoneWidth + bezel * 2 > availableWidth) {
    phoneWidth -= 2;
    bezel = Math.round(10 * (phoneWidth / PHONE_REF_WIDTH));
  }
  phoneWidth = Math.max(phoneWidth, 200);

  const phoneHeight = Math.round(phoneWidth * PHONE_ASPECT);
  const screenRadius = Math.round(38 * (phoneWidth / PHONE_REF_WIDTH));
  const frameRadius = Math.round(44 * (phoneWidth / PHONE_REF_WIDTH));
  const frameWidth = phoneWidth + bezel * 2;
  const showSideButtons = phoneWidth >= 280;

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!responsive || paused || reducedMotion) return;

    const id = window.setInterval(() => {
      setMode((current) => (current === "desktop" ? "mobile" : "desktop"));
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [responsive, paused, reducedMotion, intervalMs]);

  // 嵌入页滚动/切页时可通过 postMessage 显式指定；否则 Hub 用 mix-blend 自动适配
  useEffect(() => {
    let demoOrigin: string;
    try {
      demoOrigin = new URL(demoUrl).origin;
    } catch {
      return;
    }

    const handler = (event: MessageEvent) => {
      if (event.origin !== demoOrigin) return;
      const data = event.data;
      if (data?.type !== "portfolio-status-bar") return;
      setStatusBarMode(data.theme === "light" ? "light" : "dark");
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [demoUrl]);

  const showBrowserChrome = !responsive || !isMobile;
  const modeBadge = responsive ? (
    <span
      className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${transitionClass} ${
        isMobile ? "bg-blue-500/15 text-blue-600" : "bg-gray-200/80 text-gray-600"
      }`}
    >
      {isMobile ? "iPhone" : "桌面"}
      {paused && " · 暂停"}
    </span>
  ) : null;

  if (!responsive) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100/80 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono truncate">
            {hostname}
          </span>
        </div>
        <iframe
          src={demoUrl}
          title={`${title} 演示预览`}
          className="w-full h-[480px] border-0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-full min-w-0 overflow-x-hidden ${transitionClass} ${
        isMobile
          ? "rounded-3xl bg-[#f5f5f7]"
          : "rounded-2xl border border-gray-200 shadow-sm bg-gray-50"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`overflow-hidden ${transitionClass} ${
          showBrowserChrome ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100/80 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono truncate flex-1">
            {hostname}
          </span>
          {modeBadge}
        </div>
      </div>

      {isMobile ? (
        <div
          className={`flex justify-center items-start py-6 sm:py-8 px-2 sm:px-4 min-w-0 overflow-hidden ${transitionClass}`}
          style={{ minHeight: phoneHeight + 48 }}
        >
          <div
            className={`relative shrink-0 max-w-full ${transitionClass}`}
            style={{
              width: frameWidth,
              height: phoneHeight + bezel * 2,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#3a3a3c] via-[#1d1d1f] to-[#2c2c2e] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]"
              style={{ borderRadius: frameRadius }}
            />
            {showSideButtons && (
              <>
                <div className="absolute left-0 top-[22%] w-[2px] h-7 bg-[#4a4a4c] rounded-l-sm" />
                <div className="absolute left-0 top-[33%] w-[2px] h-12 bg-[#4a4a4c] rounded-l-sm" />
                <div className="absolute left-0 top-[48%] w-[2px] h-12 bg-[#4a4a4c] rounded-l-sm" />
                <div className="absolute right-0 top-[37%] w-[2px] h-16 bg-[#4a4a4c] rounded-r-sm" />
              </>
            )}

            <div
              className="absolute overflow-hidden bg-white"
              style={{
                top: bezel,
                left: bezel,
                width: phoneWidth,
                height: phoneHeight,
                borderRadius: screenRadius,
              }}
            >
              <iframe
                src={demoUrl}
                title={`${title} 演示预览`}
                className="w-full h-full border-0 bg-white"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
              <IPhoneStatusBar mode={statusBarMode} phoneWidth={phoneWidth} />
              <HomeIndicator mode={statusBarMode} phoneWidth={phoneWidth} />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`overflow-hidden bg-white max-w-full ${transitionClass}`}
          style={{ width: "100%", height: desktopDisplayHeight }}
        >
          <iframe
            src={demoUrl}
            title={`${title} 演示预览`}
            className="border-0 origin-top-left"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{
              width: DESKTOP_VIEWPORT.width,
              height: DESKTOP_VIEWPORT.height,
              transform: `scale(${desktopScale})`,
            }}
          />
        </div>
      )}

      {isMobile && (
        <div className="absolute top-4 right-4 z-30">{modeBadge}</div>
      )}
    </div>
  );
}
