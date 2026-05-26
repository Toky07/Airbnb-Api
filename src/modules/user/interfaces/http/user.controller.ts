import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ListUsersUseCase } from "../../application/useCase/listeUser.usecase";
import { UserOutput } from "../../domain/dtos/user.output";
import type { CreateUserDto, UpdateUserDto } from "../../domain/dtos/createUser.dto";
import { CreateUserUseCase } from "../../application/useCase/createuser.usecase";
import { UpdateUserUseCase } from "../../application/useCase/updateUser.usecase";
import { DeleteUserUseCase } from "../../application/useCase/deleteUser.usecase";
import { AuthGuard } from "../../../authentication/interfaces/guard/auth.guard";
import { UseGuards } from "@nestjs/common";

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @Get()
    async findAll(): Promise<UserOutput[]> {
        return this.listUsersUseCase.execute();
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<UserOutput> {
        return this.createUserUseCase.execute(createUserDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserOutput> {
        return this.updateUserUseCase.execute({...updateUserDto, id: Number(id)});
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        this.deleteUserUseCase.execute(Number(id));
    }
}