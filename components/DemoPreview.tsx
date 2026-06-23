"use client";

import { useEffect, useRef, useState } from "react";
import type { PreviewDevice } from "@/lib/posts";

type StatusBarTheme = "dark" | "light";
type StatusBarMode = "auto" | StatusBarTheme;

interface DemoPreviewProps {
  demoUrl: string;
  title: string;
  devices?: PreviewDevice[];
  intervalMs?: number;
}

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const PHONE_REF_WIDTH = 393;
const PHONE_ASPECT = 852 / 393;
const PHONE_MAX_WIDTH = 320;
const TABLET_REF_WIDTH = 820;
const TABLET_ASPECT = 1180 / 820;
const TABLET_MAX_WIDTH = 480;
const TABLET_MAX_HEIGHT = 560;
/** iframe 内容缩放：略小于 1 让 App 内容在框内不那么撑 */
const MOBILE_CONTENT_SCALE = 0.86;
const TABLET_CONTENT_SCALE = 0.88;

const DEVICE_LABEL: Record<PreviewDevice, string> = {
  desktop: "桌面",
  mobile: "iPhone",
  tablet: "iPad",
};

function StatusIcons({
  theme,
  auto,
  iconScale = 1,
}: {
  theme: StatusBarTheme;
  auto?: boolean;
  iconScale?: number;
}) {
  const strokeOpacity = auto ? 1 : theme === "dark" ? 0.35 : 0.45;
  const s = iconScale;

  return (
    <div
      className={`flex items-center gap-1.5 ${auto ? "opacity-90" : ""}`}
      style={{ transform: s !== 1 ? `scale(${s})` : undefined, transformOrigin: "center right" }}
    >
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
        <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="currentColor" strokeOpacity={strokeOpacity} />
        <rect x="2" y="2" width="14" height="7" rx="1" fill="currentColor" />
        <path d="M20 4.5v2a1.5 1.5 0 000-3v3z" fill="currentColor" fillOpacity={strokeOpacity} />
      </svg>
    </div>
  );
}

function DeviceStatusBar({
  mode,
  device,
  screenWidth,
}: {
  mode: StatusBarMode;
  device: "mobile" | "tablet";
  screenWidth: number;
}) {
  const refWidth = device === "mobile" ? PHONE_REF_WIDTH : TABLET_REF_WIDTH;
  const scale = screenWidth / refWidth;
  const uiScale = Math.min(scale * 1.12, 1.15);
  const auto = mode === "auto";
  const fgClass = auto
    ? "text-white mix-blend-difference"
    : mode === "dark"
      ? "text-[#1d1d1f]"
      : "text-white";

  return (
    <>
      {device === "mobile" && (
        <div
          className="absolute left-1/2 top-[4px] -translate-x-1/2 z-30 pointer-events-none"
          style={{
            width: Math.round(108 * uiScale),
            height: Math.round(32 * uiScale),
          }}
        >
          <div className="w-full h-full bg-black rounded-full ring-1 ring-white/10" />
        </div>
      )}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-1.5 h-10 pointer-events-none transition-colors duration-500 ${fgClass}`}
      >
        <span className="text-[13px] font-semibold tracking-tight leading-none">9:41</span>
        <StatusIcons theme={mode === "auto" ? "light" : mode} auto={auto} iconScale={uiScale} />
      </div>
    </>
  );
}

function HomeIndicator({
  mode,
  screenWidth,
  refWidth,
}: {
  mode: StatusBarMode;
  screenWidth: number;
  refWidth: number;
}) {
  const barW = Math.round(110 * (screenWidth / refWidth));
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

function ScaledDeviceIframe({
  src,
  title,
  width,
  height,
  contentScale,
}: {
  src: string;
  title: string;
  width: number;
  height: number;
  contentScale: number;
}) {
  return (
    <iframe
      src={src}
      title={title}
      className="absolute top-0 left-0 border-0 bg-white origin-top-left"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{
        width: width / contentScale,
        height: height / contentScale,
        transform: `scale(${contentScale})`,
      }}
    />
  );
}

function computePhoneSize(availableWidth: number) {
  let phoneWidth = Math.min(PHONE_MAX_WIDTH, Math.floor(availableWidth * 0.92));
  let bezel = Math.round(10 * (phoneWidth / PHONE_REF_WIDTH));
  while (phoneWidth > 200 && phoneWidth + bezel * 2 > availableWidth) {
    phoneWidth -= 2;
    bezel = Math.round(10 * (phoneWidth / PHONE_REF_WIDTH));
  }
  phoneWidth = Math.max(phoneWidth, 200);
  const phoneHeight = Math.round(phoneWidth * PHONE_ASPECT);
  return {
    phoneWidth,
    phoneHeight,
    bezel,
    screenRadius: Math.round(38 * (phoneWidth / PHONE_REF_WIDTH)),
    frameRadius: Math.round(44 * (phoneWidth / PHONE_REF_WIDTH)),
    frameWidth: phoneWidth + bezel * 2,
    frameHeight: phoneHeight + bezel * 2,
  };
}

function computeTabletSize(availableWidth: number) {
  let tabletWidth = Math.min(TABLET_MAX_WIDTH, Math.floor(availableWidth * 0.96));
  let tabletHeight = Math.round(tabletWidth * TABLET_ASPECT);
  if (tabletHeight > TABLET_MAX_HEIGHT) {
    tabletHeight = TABLET_MAX_HEIGHT;
    tabletWidth = Math.round(tabletHeight / TABLET_ASPECT);
  }
  const bezel = Math.round(12 * (tabletWidth / TABLET_REF_WIDTH));
  return {
    tabletWidth,
    tabletHeight,
    bezel,
    screenRadius: Math.round(18 * (tabletWidth / TABLET_REF_WIDTH)),
    frameRadius: Math.round(24 * (tabletWidth / TABLET_REF_WIDTH)),
    frameWidth: tabletWidth + bezel * 2,
    frameHeight: tabletHeight + bezel * 2,
  };
}

export function DemoPreview({
  demoUrl,
  title,
  devices = [],
  intervalMs = 4500,
}: DemoPreviewProps) {
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== "undefined" ? Math.min(window.innerWidth - 32, 960) : 360
  );
  const [statusBarMode, setStatusBarMode] = useState<StatusBarMode>("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  const previewDevices = devices.length > 0 ? devices : [];
  const activeDevice = previewDevices[deviceIndex] ?? previewDevices[0];
  const hasPreview = previewDevices.length > 0;
  const hostname = demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const transitionClass = reducedMotion
    ? ""
    : "transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]";

  const desktopScale = containerWidth / DESKTOP_VIEWPORT.width;
  const desktopDisplayHeight = DESKTOP_VIEWPORT.height * desktopScale;
  const horizontalPadding = containerWidth < 400 ? 16 : 32;
  const availableWidth = Math.max(containerWidth - horizontalPadding, 0);
  const phone = computePhoneSize(availableWidth);
  const tablet = computeTabletSize(availableWidth);

  useEffect(() => {
    setDeviceIndex(0);
  }, [devices.join(",")]);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
    if (previewDevices.length <= 1 || paused || reducedMotion) return;
    const id = window.setInterval(() => {
      setDeviceIndex((i) => (i + 1) % previewDevices.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [previewDevices, paused, reducedMotion, intervalMs]);

  useEffect(() => {
    let demoOrigin: string;
    try {
      demoOrigin = new URL(demoUrl).origin;
    } catch {
      return;
    }
    const handler = (event: MessageEvent) => {
      if (event.origin !== demoOrigin) return;
      if (event.data?.type !== "portfolio-status-bar") return;
      setStatusBarMode(event.data.theme === "light" ? "light" : "dark");
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [demoUrl]);

  const showBrowserChrome = activeDevice === "desktop";
  const isAppleDevice = activeDevice === "mobile" || activeDevice === "tablet";
  const modeBadge = hasPreview && activeDevice ? (
    <span
      className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${transitionClass} ${
        isAppleDevice ? "bg-blue-500/15 text-blue-600" : "bg-gray-200/80 text-gray-600"
      }`}
    >
      {DEVICE_LABEL[activeDevice]}
      {paused && previewDevices.length > 1 && " · 暂停"}
    </span>
  ) : null;

  if (!hasPreview) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100/80 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono truncate">{hostname}</span>
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
        isAppleDevice
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
          <span className="ml-3 text-xs text-gray-400 font-mono truncate flex-1">{hostname}</span>
          {showBrowserChrome && modeBadge}
        </div>
      </div>

      {activeDevice === "mobile" && (
        <div
          className={`flex justify-center items-start py-6 sm:py-8 px-2 sm:px-4 min-w-0 overflow-hidden ${transitionClass}`}
          style={{ minHeight: phone.frameHeight + 32 }}
        >
          <div
            className={`relative shrink-0 max-w-full ${transitionClass}`}
            style={{ width: phone.frameWidth, height: phone.frameHeight }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#3a3a3c] via-[#1d1d1f] to-[#2c2c2e] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]"
              style={{ borderRadius: phone.frameRadius }}
            />
            {phone.phoneWidth >= 280 && (
              <>
                <div className="absolute left-0 top-[22%] w-[2px] h-7 bg-[#4a4a4c] rounded-l-sm" />
                <div className="absolute left-0 top-[33%] w-[2px] h-12 bg-[#4a4a4c] rounded-l-sm" />
                <div className="absolute right-0 top-[37%] w-[2px] h-16 bg-[#4a4a4c] rounded-r-sm" />
              </>
            )}
            <div
              className="absolute overflow-hidden bg-white"
              style={{
                top: phone.bezel,
                left: phone.bezel,
                width: phone.phoneWidth,
                height: phone.phoneHeight,
                borderRadius: phone.screenRadius,
              }}
            >
              <ScaledDeviceIframe
                src={demoUrl}
                title={`${title} 演示预览`}
                width={phone.phoneWidth}
                height={phone.phoneHeight}
                contentScale={MOBILE_CONTENT_SCALE}
              />
              <DeviceStatusBar mode={statusBarMode} device="mobile" screenWidth={phone.phoneWidth} />
              <HomeIndicator mode={statusBarMode} screenWidth={phone.phoneWidth} refWidth={PHONE_REF_WIDTH} />
            </div>
          </div>
        </div>
      )}

      {activeDevice === "tablet" && (
        <div
          className={`flex justify-center items-start py-6 sm:py-8 px-2 sm:px-4 min-w-0 overflow-hidden ${transitionClass}`}
          style={{ minHeight: tablet.frameHeight + 32 }}
        >
          <div
            className={`relative shrink-0 max-w-full ${transitionClass}`}
            style={{ width: tablet.frameWidth, height: tablet.frameHeight }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#4a4a4c] via-[#2c2c2e] to-[#1d1d1f] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)]"
              style={{ borderRadius: tablet.frameRadius }}
            />
            <div
              className="absolute overflow-hidden bg-white"
              style={{
                top: tablet.bezel,
                left: tablet.bezel,
                width: tablet.tabletWidth,
                height: tablet.tabletHeight,
                borderRadius: tablet.screenRadius,
              }}
            >
              <ScaledDeviceIframe
                src={demoUrl}
                title={`${title} 演示预览`}
                width={tablet.tabletWidth}
                height={tablet.tabletHeight}
                contentScale={TABLET_CONTENT_SCALE}
              />
              <DeviceStatusBar mode={statusBarMode} device="tablet" screenWidth={tablet.tabletWidth} />
              <HomeIndicator mode={statusBarMode} screenWidth={tablet.tabletWidth} refWidth={TABLET_REF_WIDTH} />
            </div>
          </div>
        </div>
      )}

      {activeDevice === "desktop" && (
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

      {isAppleDevice && (
        <div className="absolute top-4 right-4 z-30">{modeBadge}</div>
      )}
    </div>
  );
}
