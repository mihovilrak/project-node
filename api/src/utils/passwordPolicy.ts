export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 1024;

/**
 * Validate that a password meets security requirements and return an error message if it fails validation.
 *
 * The password must be a non-empty string between configured minimum and maximum lengths, and must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.
 * @param password string
 */
export const validatePassword = (password: unknown): string | null => {
  if (typeof password !== 'string' || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`;
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain a lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain an uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain a digit';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain a special character';
  }
  return null;
};
