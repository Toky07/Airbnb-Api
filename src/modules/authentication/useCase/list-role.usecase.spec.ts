import { UserNameVO } from "../../user/domain/valueObject/username.vo";
import { RoleOutput } from "../application/dto/role.output";
import { RoleEntity } from "../domain/entities/role.entity";
import { IRoleRepository } from "../domain/repositories/role.repository";
import { ListRolesUseCase } from "./list-role.usecase";

const repository = {
    findAll: async (): Promise<RoleEntity[]> => {
        return [
            RoleOutput.fromDomain(new RoleEntity(new UserNameVO('test'))),
        ];
    },
} as IRoleRepository;

describe('ListRoleUseCase', () => {
    it('should list roles', async () => {
    const listRolesUseCase = new ListRolesUseCase(repository);
    const roles = await listRolesUseCase.execute();
    expect(roles).toBeInstanceOf(Array);
    expect(roles.length).toBe(1);
    expect(roles[0]).toBeInstanceOf(RoleOutput);
  });
});