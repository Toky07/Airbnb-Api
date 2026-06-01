import { RoleEntity } from "../../domain/entities/role.entity";

export class RoleOutput {
    constructor(
        public readonly id: number,
        public readonly name: string,
    ) {}

    public static fromDomain(role: RoleEntity): RoleOutput {
        return new RoleOutput(role.id!, role.name.value);
    }
}
