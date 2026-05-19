export class UserNameVO {
    constructor(private readonly username: string) {
        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }
    }

    get value(): string {
        return this.username;
    }
}
