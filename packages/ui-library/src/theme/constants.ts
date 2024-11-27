export const DEFAULT_SPACING = 4;
export const DEFAULT_BORDER_RADIUS = 16;
export const SPACING = (value: number) => `${DEFAULT_SPACING * value}px`;
export const MAX_FORM_WIDTH = SPACING(158); // 632px

export const baseSpacingScale: Record<'none' | 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07', string> = {
  none: SPACING(0), // 0px
  s01: SPACING(1), // 4px
  s02: SPACING(2), // 8px
  s03: SPACING(3), // 12px
  s04: SPACING(4), // 16px
  s05: SPACING(6), // 24px
  s06: SPACING(8), // 32px
  s07: SPACING(12), // 48px
};
