import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { DomainValidationException } from '../../../../shared/exceptions/domain-validation.exception';
import type { ValidationFieldError } from '../../../../shared/exceptions/validation-field.error';
import { UserNameVO } from '../../domain/valueObject/username.vo';

export type UserFieldsToValidate = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export function validateUserFields(fields: UserFieldsToValidate): void {
  const errors: ValidationFieldError[] = [];

  try {
    new UserNameVO(fields.firstName);
  } catch {
    errors.push({
      field: 'firstName',
      message: 'Le prénom doit contenir au moins 3 caractères.',
    });
  }

  try {
    new UserNameVO(fields.lastName);
  } catch {
    errors.push({
      field: 'lastName',
      message: 'Le nom doit contenir au moins 3 caractères.',
    });
  }

  try {
    new EmailVO(fields.email);
  } catch {
    errors.push({
      field: 'email',
      message: 'Adresse e-mail invalide.',
    });
  }

  try {
    new PhoneNumberVO(fields.phoneNumber);
  } catch {
    errors.push({
      field: 'phoneNumber',
      message:
        'Numéro de téléphone invalide. Utilisez le format international (ex. +33612345678).',
    });
  }

  if (errors.length > 0) {
    throw new DomainValidationException(errors);
  }
}
