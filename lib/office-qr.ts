/** Builds the URL encoded into the office poster QR. */
export function officeScanHref(origin: string, token: string) {
  return `${origin}/scan?t=${encodeURIComponent(token)}`;
}
