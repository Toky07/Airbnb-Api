export interface TokenGenerator {
  generate: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<string>;
  generateForAuthId: (authId: number) => Promise<string>;
}

export const TOKEN_GENERATOR = 'TokenGenerator';
