import type { PreviewDevice } from "./posts";

export const MOBILE_SAFE_AREA_TOP = 59;
export const TABLET_SAFE_AREA_TOP = 40;
export const MINIPROGRAM_SAFE_AREA_TOP = 88;
export const PHONE_REF_WIDTH = 393;
export const TABLET_REF_WIDTH = 820;
export const MINIPROGRAM_REF_WIDTH = 375;

export function computeSafeAreaTop(device: PreviewDevice, screenWidth: number): number {
  if (device === "mobile") {
    return Math.round(MOBILE_SAFE_AREA_TOP * (screenWidth / PHONE_REF_WIDTH));
  }
  if (device === "tablet") {
    return Math.round(TABLET_SAFE_AREA_TOP * (screenWidth / TABLET_REF_WIDTH));
  }
  if (device === "miniprogram") {
    return Math.round(MINIPROGRAM_SAFE_AREA_TOP * (screenWidth / MINIPROGRAM_REF_WIDTH));
  }
  return 0;
}
