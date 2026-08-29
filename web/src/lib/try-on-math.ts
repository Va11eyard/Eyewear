export function pxPerMm(frontWidthPx: number, lensWidthMm: number, bridgeMm: number): number {
  const mm = lensWidthMm * 2 + bridgeMm;
  if (mm <= 0 || frontWidthPx <= 0) {
    return 0;
  }
  return frontWidthPx / mm;
}
