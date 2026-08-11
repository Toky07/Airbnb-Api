import { describe, expect, it } from 'vitest';
import { DomainValidationException } from '@src/shared/exceptions/domain-validation.exception';
import { validateUserFields } from './validate-user-fields';

describe('validateUserFields', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
  };

  it('ne lève pas d’exception pour des données valides', () => {
    expect(() => validateUserFields(valid)).not.toThrow();
  });

  it('lève une DomainValidationException avec toutes les erreurs', () => {
    try {
      validateUserFields({
        firstName: 'Jo',
        lastName: 'Do',
        email: 'invalid',
        phoneNumber: '0123456789',
      });
      expect.fail('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationException);
      const response = (error as DomainValidationException).getResponse() as {
        statusCode: number;
        errors: { field: string; message: string }[];
      };
      expect(response.statusCode).toBe(400);
      expect(response.errors.length).toBeGreaterThanOrEqual(3);
      expect(response.errors.map((e) => e.field)).toContain('phoneNumber');
      expect(response.errors.map((e) => e.field)).toContain('email');
    }
  });
});
