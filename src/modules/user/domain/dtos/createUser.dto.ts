export type CreateUserDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export type UpdateUserDto = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
