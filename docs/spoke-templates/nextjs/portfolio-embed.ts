/** Portfolio Hub iframe 嵌入协议 — 复制到 src/lib/portfolio-embed.ts */

export const GUEST_USERNAME = "guest";

export function isPortfolioEmbed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("embed") === "1";
  } catch {
    return false;
  }
}

export function isGuestUsername(username: string | null | undefined): boolean {
  return normalizeGuestCheck(username) === GUEST_USERNAME;
}

function normalizeGuestCheck(username: string | null | undefined): string {
  return String(username ?? "").trim().toLowerCase();
}

/** embed 模式 + guest 用户名 → 仅 localStorage，不写 DB */
export function isGuestMode(username: string | null | undefined): boolean {
  return isPortfolioEmbed() && isGuestUsername(username);
}

/** 虚拟 progressId，避免与 DB 自增 id 冲突 */
export function guestProgressId(paperId: number): number {
  return 900_000_000 + paperId;
}

export function isGuestProgressId(progressId: number): boolean {
  return progressId >= 900_000_000;
}

export function paperIdFromGuestProgressId(progressId: number): number {
  return progressId - 900_000_000;
}
