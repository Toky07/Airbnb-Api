export function parseImportRoomImageUrls(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(';')
    .map((url) => url.trim())
    .filter(Boolean);
}
