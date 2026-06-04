export function parseKeptImages(
  body: Record<string, unknown>,
): string[] | undefined {
  if (body.keptImages === undefined) {
    return undefined;
  }

  const raw =
    typeof body.keptImages === 'string'
      ? (JSON.parse(body.keptImages) as unknown)
      : body.keptImages;

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is string => typeof item === 'string');
}
