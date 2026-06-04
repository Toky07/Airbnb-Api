import type { CreateUserDto } from '../../domain/dtos/createUser.dto';

export function parseUserBody(body: Record<string, unknown>): CreateUserDto {
  const dto: CreateUserDto = {
    firstName: String(body.firstName),
    lastName: String(body.lastName),
    email: String(body.email),
    phoneNumber: String(body.phoneNumber),
  };

  if (body.avatar !== undefined && body.avatar !== null && body.avatar !== '') {
    dto.avatar = String(body.avatar);
  }

  return dto;
}
