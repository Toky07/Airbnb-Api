import { UserNameVO } from "./username.vo";

describe('ValueObject: username value object', () => {
  it('should not be less than 3 characters', () => {
    expect(() => new UserNameVO('J')).toThrow(new Error('Username must be at least 3 characters long'));
  });
});
