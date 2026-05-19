import { EmailVO } from "./email.vo";

describe('ValueObject: email value object', () => {
  it('should be a valid email', () => {
    expect(() => new EmailVO('test')).toThrow(new Error('Invalid email'));
  });
});
