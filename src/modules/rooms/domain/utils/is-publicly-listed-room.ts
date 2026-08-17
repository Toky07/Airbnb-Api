import { NotFoundException } from '@nestjs/common';

export const PUBLIC_ROOM_STATUS = 'available';

export function isPubliclyListedRoom(
  room: { status?: string | null } | null | undefined,
): boolean {
  return room?.status === PUBLIC_ROOM_STATUS;
}

export function assertPubliclyListedRoom(
  room: { id?: number; status?: string | null } | null | undefined,
): asserts room is { id: number; status: string } {
  if (!room?.id || !isPubliclyListedRoom(room)) {
    throw new NotFoundException('Chambre introuvable.');
  }
}
