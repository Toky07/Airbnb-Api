import { TokenGenerator } from "../../domain/generator/token.generator";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { Inject, UnauthorizedException } from "@nestjs/common";
import type { IAuthRepository } from "../../domain/repositories/auth.repository";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository";

export class JwtTokenGenerator implements TokenGenerator {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    ) {}

    private async validateCredentials(email: string, password: string): Promise<{ isValid: boolean, id: number }> {
        const auth = await this.authRepository.findByEmail(email);

        return auth && await bcrypt.compare(password, auth.password);
    }

    async generate({ email, password }: { email: string, password: string }): Promise<string> {
        const isValid = await this.validateCredentials(email, password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
    
        return this.jwtService.signAsync({ email, id: 1 });
    }
}
