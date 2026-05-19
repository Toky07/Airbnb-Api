export class EmailVO {
    constructor(private readonly email: string) {
        if (!email.includes('@')) {
            throw new Error('Invalid email');
        }
    }

    get value(): string {
        return this.email;
    }
}
