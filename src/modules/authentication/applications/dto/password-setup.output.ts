export type PasswordSetupValidationOutput = {
  valid: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type SetPasswordOutput = {
  success: boolean;
};
