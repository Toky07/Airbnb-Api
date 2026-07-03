import isValidPhoneNumber from 'libphonenumber-js';

export class PhoneNumberVO {
  private readonly phoneRegex = /^\+?[0-9]\d{1,14}$/;

  constructor(private readonly phoneNumber: string) {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number');
    }
  }

  get value(): string {
    return this.phoneNumber;
  }
}
