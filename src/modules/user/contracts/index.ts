/**
 * Surface publique du module user.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf UserModule Nest et ORM UserEntity).
 */
export {
  USER_REPOSITORY,
  type IUserRepository,
} from '@src/modules/user/domain/repositories/user.repository';
export { User } from '@src/modules/user/domain/entities/user.entity';
export { UserOutput } from '@src/modules/user/domain/dtos/user.output';
export { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
export { RegisterHostCommand } from '@src/modules/user/applications/useCase/commands/RegisterHostCommand';
export { UpdateMyProfileCommand } from '@src/modules/user/applications/useCase/commands/UpdateMyProfileCommand';
export { CreateUserCommand } from '@src/modules/user/applications/useCase/commands/CreateUserCommand';
export { validateUserFields } from '@src/modules/user/applications/validation/validate-user-fields';
export { parseMyProfileBody } from '@src/modules/user/interfaces/http/parse-my-profile-body';
