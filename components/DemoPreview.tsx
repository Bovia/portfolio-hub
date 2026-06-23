"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PreviewDevice } from "@/lib/posts";
import { computeSafeAreaTop, MOBILE_SAFE_AREA_TOP, TABLET_SAFE_AREA_TOP } from "@/lib/portfolio-embed";

type StatusBarTheme = "dark" | "light";

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
const MOBILE_CONTENT_SCALE = 0.86;
const TABLET_CONTENT_SCALE = 0.80;
const DESKTOP_CHROME_REF_H = 26;
const MINIPROGRAM_CONTENT_SCALE = 0.86;
const MINIPROGRAM_REF_WIDTH = 375;
/** 状态栏 44 + 导航栏 44（375pt 宽设计稿） */
const MINIPROGRAM_STATUS_H = 44;
const MINIPROGRAM_NAV_H = 44;

const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
const MORPH_MS = 750;

/** iPhone 14 Pro 灵动岛逻辑尺寸（393pt 宽） */
const MOBILE_ISLAND = { width: 126, height: 37, top: 11 };

const DEVICE_LABEL: Record<PreviewDevice, string> = {
  desktop: "Mac",
  mobile: "iPhone",
  tablet: "iPad",
  miniprogram: "小程序",
};

interface DeviceLayout {
  mode: PreviewDevice;
  frameWidth: number;
  frameHeight: number;
  frameRadius: number;
  bezel: number;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  iframeWidth: number;
  iframeHeight: number;
  iframeTop: number;
  iframeClipHeight: number;
  iframeTransform: string;
  isAppleFrame: boolean;
  isMacBook: boolean;
  macBookBaseHeight: number;
  browserChromeHeight: number;
  showSideButtons: boolean;
  showOverlays: boolean;
  overlayKind: "ios" | "miniprogram" | "none";
  showHomeIndicator: boolean;
  statusDevice: "mobile" | "tablet";
  overlayRefWidth: number;
  stageMinHeight: number;
}

function DevicePickerIcon({ device, active }: { device: PreviewDevice; active: boolean }) {
  const c = active ? "#1d1d1f" : "#86868b";

  if (device === "desktop") {
    return (
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden>
        <rect x="1" y="1" width="26" height="13" rx="1.5" stroke={c} strokeWidth="1.4" />
        <path d="M0 17h28" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 17v1.5h8V17" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }

  if (device === "mobile" || device === "miniprogram") {
    return (
      <svg width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden>
        <rect x="1" y="1" width="12" height="22" rx="2.5" stroke={c} strokeWidth="1.4" />
        {device === "miniprogram" ? (
          <>
            <circle cx="10" cy="5" r="2.5" fill={c} fillOpacity={active ? 0.85 : 0.55} />
            <path d="M9 5h2M10 4v2" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
          </>
        ) : (
          <rect x="5" y="3.5" width="4" height="1.5" rx="0.6" fill={c} fillOpacity={active ? 1 : 0.55} />
        )}
      </svg>
    );
  }

  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
      <rect x="1" y="1" width="18" height="22" rx="2.5" stroke={c} strokeWidth="1.4" />
      <circle cx="10" cy="19.5" r="0.9" fill={c} fillOpacity={active ? 0.35 : 0.22} />
    </svg>
  );
}

function DeviceSwitcher({
  devices,
  activeIndex,
  onSelect,
}: {
  devices: PreviewDevice[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (devices.length <= 1) return null;

  return (
    <div className="flex justify-center pt-3 pb-1.5" role="tablist" aria-label="预览设备">
      <div className="inline-flex items-center gap-0.5 rounded-full p-1 bg-[#e8e8ed]/60">
        {devices.map((device, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={device}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={DEVICE_LABEL[device]}
              title={DEVICE_LABEL[device]}
              onClick={() => onSelect(index)}
              className={`flex items-center justify-center w-11 h-9 rounded-full transition-all duration-300 ease-out ${
                active
                  ? "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <DevicePickerIcon device={device} active={active} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

/** 系统级固定层：灵动岛 + 状态栏（不遮挡滚动内容） */
function SystemChrome({
  device,
  screenWidth,
  morphStyle,
}: {
  device: "mobile" | "tablet";
  screenWidth: number;
  morphStyle?: CSSProperties;
}) {
  const refWidth = device === "mobile" ? PHONE_REF_WIDTH : TABLET_REF_WIDTH;
  const scale = screenWidth / refWidth;
  const safeTop = Math.round(
    (device === "mobile" ? MOBILE_SAFE_AREA_TOP : TABLET_SAFE_AREA_TOP) *
      (screenWidth / (device === "mobile" ? PHONE_REF_WIDTH : TABLET_REF_WIDTH))
  );
  const iconScale = Math.min(scale * 1.06, 1.1);
  const timeSize = Math.max(11, Math.round(15 * scale));
  const statusPaddingBottom = device === "mobile" ? Math.round(8 * scale) : Math.round(10 * scale);

  const islandW = Math.round(MOBILE_ISLAND.width * scale);
  const islandH = Math.round(MOBILE_ISLAND.height * scale);
  const islandTop = Math.round(MOBILE_ISLAND.top * scale);
  const islandRadius = Math.round(islandH / 2);

  return (
    <>
      {device === "mobile" && (
        <div
          className="absolute left-1/2 z-30 pointer-events-none"
          style={{
            top: islandTop,
            width: islandW,
            height: islandH,
            transform: "translateX(-50%)",
            ...morphStyle,
          }}
        >
          <div
            className="w-full h-full bg-black ring-1 ring-white/[0.08]"
            style={{ borderRadius: islandRadius }}
          />
        </div>
      )}

      <div
        className="absolute top-0 inset-x-0 z-20 flex items-end justify-between px-4 pointer-events-none text-white mix-blend-difference"
        style={{
          height: safeTop,
          paddingBottom: statusPaddingBottom,
          ...morphStyle,
        }}
      >
        <span className="font-semibold tracking-tight leading-none" style={{ fontSize: timeSize }}>
          9:41
        </span>
        <StatusIcons theme="light" auto iconScale={iconScale} />
      </div>
    </>
  );
}

/** 微信小程序顶栏：状态栏 + 导航栏 + 胶囊按钮 */
function MiniProgramChrome({
  screenWidth,
  pageTitle,
  morphStyle,
}: {
  screenWidth: number;
  pageTitle: string;
  morphStyle?: CSSProperties;
}) {
  const scale = screenWidth / MINIPROGRAM_REF_WIDTH;
  const statusH = Math.round(MINIPROGRAM_STATUS_H * scale);
  const navH = Math.round(MINIPROGRAM_NAV_H * scale);
  const topInset = statusH + navH;
  const capsuleW = Math.round(87 * scale);
  const capsuleH = Math.round(32 * scale);
  const fontSize = Math.max(11, Math.round(14 * scale));
  const titleSize = Math.max(12, Math.round(16 * scale));
  const iconScale = Math.min(scale * 1.06, 1.1);

  return (
    <div
      className="absolute top-0 inset-x-0 z-20 pointer-events-none bg-white"
      style={{ height: topInset, ...morphStyle }}
    >
      <div
        className="absolute top-0 inset-x-0 flex items-end justify-between px-4 text-[#1d1d1f]"
        style={{ height: statusH, paddingBottom: Math.round(4 * scale) }}
      >
        <span className="font-semibold leading-none" style={{ fontSize }}>
          9:41
        </span>
        <StatusIcons theme="dark" iconScale={iconScale} />
      </div>

      <div
        className="absolute inset-x-0 flex items-center border-b border-black/[0.06]"
        style={{ top: statusH, height: navH, paddingLeft: Math.round(10 * scale), paddingRight: Math.round(8 * scale) }}
      >
        <span className="text-[#1d1d1f] leading-none shrink-0" style={{ fontSize: Math.round(22 * scale), width: Math.round(28 * scale) }}>
          ‹
        </span>
        <span
          className="flex-1 text-center font-medium text-[#1d1d1f] truncate px-1"
          style={{ fontSize: titleSize }}
        >
          {pageTitle}
        </span>
        <div
          className="shrink-0 flex items-center border border-black/15 bg-white/80"
          style={{
            width: capsuleW,
            height: capsuleH,
            borderRadius: capsuleH / 2,
            padding: `0 ${Math.round(10 * scale)}px`,
            gap: Math.round(8 * scale),
          }}
        >
          <span className="flex gap-[3px] items-center" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
            <span className="rounded-full bg-[#1d1d1f]" style={{ width: 3, height: 3 }} />
            <span className="rounded-full bg-[#1d1d1f]" style={{ width: 4, height: 4 }} />
            <span className="rounded-full bg-[#1d1d1f]" style={{ width: 3, height: 3 }} />
          </span>
          <span className="w-px h-[18px] bg-black/15" style={{ transform: `scaleY(${scale})` }} />
          <span
            className="rounded-full border-2 border-[#1d1d1f]"
            style={{ width: Math.round(16 * scale), height: Math.round(16 * scale) }}
          />
        </div>
      </div>
    </div>
  );
}

function HomeIndicator({
  screenWidth,
  refWidth,
  morphStyle,
}: {
  screenWidth: number;
  refWidth: number;
  morphStyle?: CSSProperties;
}) {
  const barW = Math.round(110 * (screenWidth / refWidth));

  return (
    <div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[4px] rounded-full z-20 pointer-events-none bg-white mix-blend-difference opacity-90"
      style={{ width: barW, ...morphStyle }}
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

function computeMacBookSize(availableWidth: number) {
  const lidWidth = availableWidth;
  const bezel = Math.max(10, Math.round(12 * (lidWidth / 960)));
  const screenWidth = lidWidth - bezel * 2;
  const screenHeight = Math.round(screenWidth * (DESKTOP_VIEWPORT.height / DESKTOP_VIEWPORT.width));
  const lidHeight = screenHeight + bezel * 2;
  const baseHeight = Math.max(14, Math.round(18 * (lidWidth / 960)));
  const lidRadius = Math.max(12, Math.round(16 * (lidWidth / 960)));
  const screenRadius = Math.max(6, Math.round(6 * (lidWidth / 960)));
  return {
    frameWidth: lidWidth,
    frameHeight: lidHeight + baseHeight - 2,
    lidHeight,
    screenWidth,
    screenHeight,
    bezel,
    baseHeight,
    lidRadius,
    screenRadius,
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

function getDeviceLayout(
  device: PreviewDevice,
  availableWidth: number,
  phone: ReturnType<typeof computePhoneSize>,
  tablet: ReturnType<typeof computeTabletSize>
): DeviceLayout {
  if (device === "mobile") {
    const safeAreaTop = computeSafeAreaTop("mobile", phone.phoneWidth);
    const contentHeight = phone.phoneHeight - safeAreaTop;
    return {
      mode: "mobile",
      frameWidth: phone.frameWidth,
      frameHeight: phone.frameHeight,
      frameRadius: phone.frameRadius,
      bezel: phone.bezel,
      screenWidth: phone.phoneWidth,
      screenHeight: phone.phoneHeight,
      screenRadius: phone.screenRadius,
      iframeTop: safeAreaTop,
      iframeClipHeight: contentHeight,
      iframeWidth: phone.phoneWidth / MOBILE_CONTENT_SCALE,
      iframeHeight: contentHeight / MOBILE_CONTENT_SCALE,
      iframeTransform: `scale(${MOBILE_CONTENT_SCALE})`,
      isAppleFrame: true,
      isMacBook: false,
      macBookBaseHeight: 0,
      browserChromeHeight: 0,
      showSideButtons: phone.phoneWidth >= 280,
      showOverlays: true,
      overlayKind: "ios",
      showHomeIndicator: true,
      statusDevice: "mobile",
      overlayRefWidth: PHONE_REF_WIDTH,
      stageMinHeight: phone.frameHeight + 48,
    };
  }

  if (device === "tablet") {
    const safeAreaTop = computeSafeAreaTop("tablet", tablet.tabletWidth);
    const contentHeight = tablet.tabletHeight - safeAreaTop;
    return {
      mode: "tablet",
      frameWidth: tablet.frameWidth,
      frameHeight: tablet.frameHeight,
      frameRadius: tablet.frameRadius,
      bezel: tablet.bezel,
      screenWidth: tablet.tabletWidth,
      screenHeight: tablet.tabletHeight,
      screenRadius: tablet.screenRadius,
      iframeTop: safeAreaTop,
      iframeClipHeight: contentHeight,
      iframeWidth: tablet.tabletWidth / TABLET_CONTENT_SCALE,
      iframeHeight: contentHeight / TABLET_CONTENT_SCALE,
      iframeTransform: `scale(${TABLET_CONTENT_SCALE})`,
      isAppleFrame: true,
      isMacBook: false,
      macBookBaseHeight: 0,
      browserChromeHeight: 0,
      showSideButtons: false,
      showOverlays: true,
      overlayKind: "ios",
      showHomeIndicator: true,
      statusDevice: "tablet",
      overlayRefWidth: TABLET_REF_WIDTH,
      stageMinHeight: tablet.frameHeight + 48,
    };
  }

  if (device === "miniprogram") {
    const safeAreaTop = computeSafeAreaTop("miniprogram", phone.phoneWidth);
    const contentHeight = phone.phoneHeight - safeAreaTop;
    return {
      mode: "miniprogram",
      frameWidth: phone.frameWidth,
      frameHeight: phone.frameHeight,
      frameRadius: phone.frameRadius,
      bezel: phone.bezel,
      screenWidth: phone.phoneWidth,
      screenHeight: phone.phoneHeight,
      screenRadius: phone.screenRadius,
      iframeTop: safeAreaTop,
      iframeClipHeight: contentHeight,
      iframeWidth: phone.phoneWidth / MINIPROGRAM_CONTENT_SCALE,
      iframeHeight: contentHeight / MINIPROGRAM_CONTENT_SCALE,
      iframeTransform: `scale(${MINIPROGRAM_CONTENT_SCALE})`,
      isAppleFrame: true,
      isMacBook: false,
      macBookBaseHeight: 0,
      browserChromeHeight: 0,
      showSideButtons: phone.phoneWidth >= 280,
      showOverlays: true,
      overlayKind: "miniprogram",
      showHomeIndicator: false,
      statusDevice: "mobile",
      overlayRefWidth: MINIPROGRAM_REF_WIDTH,
      stageMinHeight: phone.frameHeight + 48,
    };
  }

  const mb = computeMacBookSize(availableWidth);
  /** 按屏幕宽度等比缩放，贴满屏幕区域（不再额外缩小留边） */
  const desktopScale = mb.screenWidth / DESKTOP_VIEWPORT.width;
  const browserChromeHeight = Math.max(20, Math.round(DESKTOP_CHROME_REF_H * (mb.screenWidth / 800)));
  const contentHeight = mb.screenHeight - browserChromeHeight;

  return {
    mode: "desktop",
    frameWidth: mb.frameWidth,
    frameHeight: mb.frameHeight,
    frameRadius: mb.lidRadius,
    bezel: mb.bezel,
    screenWidth: mb.screenWidth,
    screenHeight: mb.screenHeight,
    screenRadius: mb.screenRadius,
    iframeTop: browserChromeHeight,
    iframeClipHeight: contentHeight,
    iframeWidth: DESKTOP_VIEWPORT.width,
    iframeHeight: DESKTOP_VIEWPORT.height,
    iframeTransform: `scale(${desktopScale})`,
    isAppleFrame: true,
    isMacBook: true,
    macBookBaseHeight: mb.baseHeight,
    browserChromeHeight,
    showSideButtons: false,
    showOverlays: false,
    overlayKind: "none",
    showHomeIndicator: false,
    statusDevice: "tablet",
    overlayRefWidth: TABLET_REF_WIDTH,
    stageMinHeight: mb.frameHeight + 48,
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
  const containerRef = useRef<HTMLDivElement>(null);

  const previewDevices = devices.length > 0 ? devices : [];
  const activeDevice = previewDevices[deviceIndex] ?? previewDevices[0];
  const hasPreview = previewDevices.length > 0;
  const hostname = demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const morphTransition = reducedMotion
    ? undefined
    : {
        transitionProperty: "width, height, top, left, border-radius, transform, opacity, box-shadow, min-height, padding, background-color",
        transitionDuration: `${MORPH_MS}ms`,
        transitionTimingFunction: EASE,
      };

  const horizontalPadding = containerWidth < 400 ? 16 : 32;
  const availableWidth = Math.max(containerWidth - horizontalPadding, 0);
  const phone = computePhoneSize(availableWidth);
  const tablet = computeTabletSize(availableWidth);

  const layout = useMemo(
    () => getDeviceLayout(activeDevice, availableWidth, phone, tablet),
    [activeDevice, availableWidth, phone, tablet]
  );

  const showDeviceSwitcher = previewDevices.length > 1;
  const usesAppleBg = layout.isAppleFrame || showDeviceSwitcher;

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

  const handleDeviceSelect = (index: number) => {
    setDeviceIndex(index);
    setPaused(true);
  };

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
      className={`relative w-full max-w-full min-w-0 overflow-hidden ${
        usesAppleBg
          ? "rounded-3xl bg-[#f5f5f7]"
          : "rounded-2xl border border-gray-200 shadow-sm bg-gray-50"
      }`}
      style={{
        ...morphTransition,
        transitionProperty: reducedMotion
          ? undefined
          : "background-color, border-color, border-radius, box-shadow",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {showDeviceSwitcher && (
        <DeviceSwitcher
          devices={previewDevices}
          activeIndex={deviceIndex}
          onSelect={handleDeviceSelect}
        />
      )}

      {/* 统一舞台：单 iframe + morphing 设备框 */}
      <div
        className="flex justify-center items-start px-2 sm:px-4 min-w-0 overflow-hidden"
        style={{
          minHeight: layout.stageMinHeight,
          paddingTop: layout.isAppleFrame ? 4 : 0,
          paddingBottom: layout.isAppleFrame ? 20 : 0,
          ...morphTransition,
        }}
      >
        <div
          className="relative overflow-hidden shrink-0 max-w-full mx-auto"
          style={{
            width: layout.frameWidth,
            height: layout.frameHeight,
            borderRadius: layout.frameRadius,
            ...morphTransition,
          }}
        >
          {/* 设备外壳：手机 / iPad / MacBook 上盖 */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: layout.isMacBook ? layout.frameHeight - layout.macBookBaseHeight + 2 : "100%",
              borderRadius: layout.frameRadius,
              opacity: layout.isAppleFrame ? 1 : 0,
              boxShadow: layout.isAppleFrame
                ? layout.isMacBook
                  ? "0 16px 40px -14px rgba(0,0,0,0.35)"
                  : "0 24px 60px -12px rgba(0,0,0,0.45)"
                : "none",
              background: layout.isMacBook
                ? "linear-gradient(to bottom, #48484a, #2c2c2e 55%, #1d1d1f)"
                : layout.mode === "mobile" || layout.mode === "miniprogram"
                  ? "linear-gradient(to bottom, #3a3a3c, #1d1d1f, #2c2c2e)"
                  : layout.mode === "tablet"
                    ? "linear-gradient(to bottom, #4a4a4c, #2c2c2e, #1d1d1f)"
                    : "transparent",
              ...morphTransition,
            }}
          />

          {/* MacBook 底座 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: layout.frameHeight - layout.macBookBaseHeight,
              width: "100%",
              height: layout.macBookBaseHeight,
              borderRadius: "0 0 10px 10px",
              opacity: layout.isMacBook ? 1 : 0,
              background: "linear-gradient(to bottom, #3a3a3c, #252527)",
              boxShadow: "0 6px 16px -8px rgba(0,0,0,0.25)",
              ...morphTransition,
            }}
          >
            <div
              className="absolute left-1/2 top-[35%] -translate-x-1/2 rounded-full bg-white/[0.08]"
              style={{ width: "18%", height: 3 }}
            />
          </div>

          {/* iPhone 侧键 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: layout.showSideButtons ? 1 : 0, ...morphTransition }}
          >
            <div className="absolute left-0 top-[22%] w-[2px] h-7 bg-[#4a4a4c] rounded-l-sm" />
            <div className="absolute left-0 top-[33%] w-[2px] h-12 bg-[#4a4a4c] rounded-l-sm" />
            <div className="absolute right-0 top-[37%] w-[2px] h-16 bg-[#4a4a4c] rounded-r-sm" />
          </div>

          {/* MacBook 摄像头 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
            style={{
              top: layout.bezel - Math.max(3, Math.round(4 * (layout.screenWidth / 800))),
              width: 6,
              height: 6,
              borderRadius: 3,
              opacity: layout.isMacBook ? 1 : 0,
              background: "#1a1a1c",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              ...morphTransition,
            }}
          />

          {/* 屏幕区域 — iframe 始终在此 */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{
              top: layout.bezel,
              left: layout.bezel,
              width: layout.screenWidth,
              height: layout.screenHeight,
              borderRadius: layout.screenRadius,
              ...morphTransition,
            }}
          >
            {/* Mac 浏览器顶栏 — Safari 风格 */}
            <div
              className="absolute top-0 inset-x-0 z-10 flex items-center bg-[#ebebeb] border-b border-black/[0.05] overflow-hidden"
              style={{
                height: layout.browserChromeHeight,
                opacity: layout.isMacBook ? 1 : 0,
                paddingLeft: Math.round(10 * (layout.screenWidth / 800)),
                paddingRight: Math.round(10 * (layout.screenWidth / 800)),
                ...morphTransition,
              }}
            >
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
                <span className="w-2 h-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center min-w-0 px-2">
                <span
                  className="truncate text-[9px] text-[#6e6e73] font-mono leading-none bg-black/[0.05] rounded-md"
                  style={{
                    maxWidth: "58%",
                    padding: `${Math.max(2, Math.round(3 * (layout.screenWidth / 800)))}px ${Math.round(8 * (layout.screenWidth / 800))}px`,
                  }}
                >
                  {hostname}
                </span>
              </div>
              <div className="shrink-0" style={{ width: Math.round(36 * (layout.screenWidth / 800)) }} />
            </div>

            <div
              className="absolute inset-x-0 bottom-0 overflow-hidden bg-white"
              style={{
                top: layout.iframeTop,
                ...morphTransition,
              }}
            >
              <iframe
                src={demoUrl}
                title={`${title} 演示预览`}
                className="absolute top-0 left-0 border-0 bg-white origin-top-left"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms"
                style={{
                  width: layout.iframeWidth,
                  height: layout.iframeHeight,
                  transform: layout.iframeTransform,
                  ...morphTransition,
                }}
              />
            </div>

            {/* 设备顶栏 overlay — 按形态切换，不卸载 iframe */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: layout.showOverlays ? 1 : 0,
                ...morphTransition,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  opacity: layout.overlayKind === "ios" ? 1 : 0,
                  ...morphTransition,
                }}
              >
                <SystemChrome
                  device={layout.statusDevice}
                  screenWidth={layout.screenWidth}
                  morphStyle={morphTransition}
                />
                {layout.showHomeIndicator && (
                  <HomeIndicator
                    screenWidth={layout.screenWidth}
                    refWidth={layout.overlayRefWidth}
                    morphStyle={morphTransition}
                  />
                )}
              </div>
              <div
                className="absolute inset-0"
                style={{
                  opacity: layout.overlayKind === "miniprogram" ? 1 : 0,
                  ...morphTransition,
                }}
              >
                <MiniProgramChrome
                  screenWidth={layout.screenWidth}
                  pageTitle={title}
                  morphStyle={morphTransition}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
