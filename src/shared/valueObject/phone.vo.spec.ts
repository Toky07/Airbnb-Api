import { PhoneNumberVO } from "./phone.vo";

describe('ValueObject: phone number value object', () => {
  it('should be a valid phone number', () => {
    expect(() => new PhoneNumberVO('1234567890')).toThrow(new Error('Invalid phone number'));
  });

  it('should get value of phone number', () => {
    const phoneNumber = new PhoneNumberVO('+1234567890');
    expect(phoneNumber.value).toBe('+1234567890');
  });
});
