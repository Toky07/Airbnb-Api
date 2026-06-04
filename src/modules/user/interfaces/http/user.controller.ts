import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ListUsersUseCase } from "../../application/useCase/listeUser.usecase";
import { UserOutput } from "../../domain/dtos/user.output";
import type { CreateUserDto, UpdateUserDto } from "../../domain/dtos/createUser.dto";
import { CreateUserUseCase } from "../../application/useCase/createuser.usecase";
import { UpdateUserUseCase } from "../../application/useCase/updateUser.usecase";
import { DeleteUserUseCase } from "../../application/useCase/deleteUser.usecase";
import { AuthGuard } from "../../../authentication/interfaces/guard/auth.guard";
import { FindUserUseCase } from "../../application/useCase/findUser.usecase";
import { parseUserBody } from "./parse-user-body";
import type { UploadFile } from "../../../media/types/upload-file";

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly findUserUseCase: FindUserUseCase,
    ) {}

    @Get()
    async findAll(): Promise<UserOutput[]> {
        return this.listUsersUseCase.execute();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<UserOutput> {
        return this.findUserUseCase.execute(Number(id)) as unknown as UserOutput;
    }

    @Post()
    @UseInterceptors(FileInterceptor('avatar'))
    async create(
        @Body() body: CreateUserDto | Record<string, unknown>,
        @UploadedFile() avatar?: UploadFile,
    ): Promise<UserOutput> {
        const createUserDto =
            typeof (body as CreateUserDto).email === 'string'
                ? (body as CreateUserDto)
                : parseUserBody(body as Record<string, unknown>);
        return this.createUserUseCase.execute(createUserDto, avatar);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto | Record<string, unknown>,
        @UploadedFile() avatar?: UploadFile,
    ): Promise<UserOutput> {
        const updateUserDto =
            typeof (body as UpdateUserDto).email === 'string'
                ? (body as UpdateUserDto)
                : parseUserBody(body as Record<string, unknown>);
        return this.updateUserUseCase.execute(
            { ...updateUserDto, id: Number(id) },
            avatar,
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        await this.deleteUserUseCase.execute(Number(id));
    }
}