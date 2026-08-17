import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsOptional()
  @IsString()
  cc?: string;

  @IsOptional()
  @IsString()
  bcc?: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsBoolean()
  isHtml?: boolean;

  @IsOptional()
  @IsString()
  sourceModule?: string;
}

export function parseRecipientList(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
