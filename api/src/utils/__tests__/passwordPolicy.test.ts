import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from '../passwordPolicy';

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('Correct-Horse-Battery-9')).toBeNull();
  });

  it.each([
    [undefined, 'Password is required'],
    [123, 'Password is required'],
    ['', 'Password is required'],
    ['Aa1!', `at least ${MIN_PASSWORD_LENGTH}`],
    [
      'Aa1!' + 'a'.repeat(MAX_PASSWORD_LENGTH),
      `at most ${MAX_PASSWORD_LENGTH}`,
    ],
    ['CORRECT-HORSE-9', 'lowercase'],
    ['correct-horse-9', 'uppercase'],
    ['Correct-Horse-Battery', 'digit'],
    ['CorrectHorseBattery9', 'special character'],
  ])('rejects case #%#', (password, message) => {
    expect(validatePassword(password)).toContain(message);
  });
});
