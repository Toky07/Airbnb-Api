import { HttpException, HttpStatus } from '@nestjs/common';
import type { ValidationFieldError } from './validation-field.error';

export class DomainValidationException extends HttpException {
  constructor(errors: ValidationFieldError[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Les données envoyées sont invalides.',
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
