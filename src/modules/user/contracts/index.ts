/**
 * Surface publique du module user.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf UserModule Nest et ORM UserEntity).
 */
export {
  USER_REPOSITORY,
  type IUserRepository,
} from '../domain/repositories/user.repository';
export { User } from '../domain/entities/user.entity';
export { UserOutput } from '../domain/dtos/user.output';
export { UserNameVO } from '../domain/valueObject/username.vo';
export { RegisterHostCommand } from '../applications/useCase/commands/RegisterHostCommand';
export { UpdateMyProfileCommand } from '../applications/useCase/commands/UpdateMyProfileCommand';
export { CreateUserCommand } from '../applications/useCase/commands/CreateUserCommand';
export { validateUserFields } from '../applications/validation/validate-user-fields';
export { parseMyProfileBody } from '../interfaces/http/parse-my-profile-body';
