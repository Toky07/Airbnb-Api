export type ImportRowValidationResult =
  | { ok: true }
  | { ok: false; field: string; message: string };
