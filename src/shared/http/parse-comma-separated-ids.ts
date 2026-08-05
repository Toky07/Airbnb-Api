export function parseCommaSeparatedIds(value?: string): number[] {
  return (value ?? '')
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}
