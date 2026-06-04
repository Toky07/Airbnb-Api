export type JwtPayload = {
  sub: number;
  email: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
};
