export interface TokenGenerator {
  generate: ({ email, password }: { email: string, password: string }) => Promise<string>;
}
