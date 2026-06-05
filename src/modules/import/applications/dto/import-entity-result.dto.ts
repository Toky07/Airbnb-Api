import type { ImportRowError } from './import-batch.dto';

export type ImportEntityResult = {
  created: number;
  errors: ImportRowError[];
};

export const emptyImportEntityResult = (): ImportEntityResult => ({
  created: 0,
  errors: [],
});
