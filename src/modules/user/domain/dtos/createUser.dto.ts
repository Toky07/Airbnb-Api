export type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
};

export type UpdateUserDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
};
