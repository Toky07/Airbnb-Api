import type {
  ImportPropertyRowDto,
  ImportRoomRowDto,
  ImportUserRowDto,
} from '../../src/modules/import/applications/dto/import-batch.dto';

function requireField(
  row: Record<string, string>,
  key: string,
): string | null {
  const value = row[key]?.trim();
  return value ? value : null;
}

function parseNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number(value?.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapUserRows(rows: Record<string, string>[]): ImportUserRowDto[] {
  return rows.flatMap((row) => {
    const firstName = requireField(row, 'firstName');
    const lastName = requireField(row, 'lastName');
    const email = requireField(row, 'email');
    const phoneNumber = requireField(row, 'phoneNumber');
    if (!firstName || !lastName || !email || !phoneNumber) {
      return [];
    }
    return [
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        avatarUrl: row.avatarUrl?.trim() || undefined,
      },
    ];
  });
}

export function mapPropertyRows(
  rows: Record<string, string>[],
): ImportPropertyRowDto[] {
  return rows.flatMap((row) => {
    const name = requireField(row, 'name');
    const description = requireField(row, 'description');
    const ownerEmail = requireField(row, 'ownerEmail');
    if (!name || !description || !ownerEmail) {
      return [];
    }
    return [
      {
        name,
        description,
        address: requireField(row, 'address') ?? '',
        city: requireField(row, 'city') ?? '',
        country: requireField(row, 'country') ?? '',
        latitude: parseNumber(row.latitude),
        longitude: parseNumber(row.longitude),
        checkInTime: requireField(row, 'checkInTime') ?? '15:00',
        checkOutTime: requireField(row, 'checkOutTime') ?? '11:00',
        ownerEmail,
        imageUrl: row.imageUrl?.trim() || undefined,
      },
    ];
  });
}

export function mapRoomRows(rows: Record<string, string>[]): ImportRoomRowDto[] {
  return rows.flatMap((row) => {
    const name = requireField(row, 'name');
    const description = requireField(row, 'description');
    const propertyName = requireField(row, 'propertyName');
    if (!name || !description || !propertyName) {
      return [];
    }
    return [
      {
        name,
        description,
        pricePerNight: parseNumber(row.pricePerNight),
        maxGuests: parseNumber(row.maxGuests, 1),
        bedrooms: parseNumber(row.bedrooms, 1),
        bathrooms: parseNumber(row.bathrooms, 1),
        beds: parseNumber(row.beds, 1),
        quantity: parseNumber(row.quantity, 1),
        size: parseNumber(row.size, 20),
        status: requireField(row, 'status') ?? 'available',
        propertyName,
        imageUrls: row.imageUrls?.trim() || undefined,
      },
    ];
  });
}
