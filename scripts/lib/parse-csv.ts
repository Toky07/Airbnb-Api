/**
 * Parse un CSV simple (séparateur virgule, guillemets, en-tête obligatoire).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = splitCsvLines(text.trim());
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!.trim();
    if (!line) {
      continue;
    }
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      row[header.trim()] = (values[columnIndex] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitCsvLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let index = 0;

  while (index < line.length) {
    if (line[index] === '"') {
      let cell = '';
      index += 1;
      while (index < line.length) {
        if (line[index] === '"') {
          if (line[index + 1] === '"') {
            cell += '"';
            index += 2;
            continue;
          }
          index += 1;
          break;
        }
        cell += line[index]!;
        index += 1;
      }
      values.push(cell);
      if (line[index] === ',') {
        index += 1;
      }
      continue;
    }

    let cell = '';
    while (index < line.length && line[index] !== ',') {
      cell += line[index]!;
      index += 1;
    }
    values.push(cell.trim());
    if (line[index] === ',') {
      index += 1;
    }
  }

  return values;
}
