export type CreateUserDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export type UpdateUserDto = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}
