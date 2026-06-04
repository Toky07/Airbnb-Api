import type { UpdateMyProfileDto } from '../../application/dto/update-my-profile.dto';

export function parseMyProfileBody(body: Record<string, unknown>): UpdateMyProfileDto {
  const dto: UpdateMyProfileDto = {
    firstName: String(body.firstName ?? ''),
    lastName: String(body.lastName ?? ''),
    phoneNumber: String(body.phoneNumber ?? ''),
  };

  if (body.avatar !== undefined && body.avatar !== null && body.avatar !== '') {
    dto.avatar = String(body.avatar);
  }

  return dto;
}
