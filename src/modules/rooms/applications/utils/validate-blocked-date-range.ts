import { BadRequestException } from '@nestjs/common';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateBlockedDateRange(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  const start = startDate?.trim() ?? '';
  const end = endDate?.trim() ?? '';

  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    throw new BadRequestException(
      'Les dates doivent être au format AAAA-MM-JJ.',
    );
  }

  if (end <= start) {
    throw new BadRequestException(
      'La date de fin doit être postérieure à la date de début.',
    );
  }

  return { startDate: start, endDate: end };
}
