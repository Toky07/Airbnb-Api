export type CreateUserDto = {
    firstName: string;
    lastName: string;
    email: string;
}

export type UpdateUserDto = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}
