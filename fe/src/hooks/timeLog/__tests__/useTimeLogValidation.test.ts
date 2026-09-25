import { renderHook, act } from '@testing-library/react';
import { MAX_LOG_HOURS, useTimeLogValidation } from '../useTimeLogValidation';

describe('useTimeLogValidation', () => {
  it('should initialize with empty error', () => {
    const { result } = renderHook(() => useTimeLogValidation());
    expect(result.current.timeError).toBe('');
  });

  describe('validateAndFormatTime', () => {
    it('should validate and format valid decimal hours', () => {
      const { result } = renderHook(() => useTimeLogValidation());
      const testCases = [
        { input: '1', expected: 1 },
        { input: '1.5', expected: 1.5 },
        { input: '2.25', expected: 2.25 },
        { input: '0.5', expected: 0.5 },
      ];

      testCases.forEach(({ input, expected }) => {
        let formatted: number | null = null;
        act(() => {
          formatted = result.current.validateAndFormatTime(input);
        });
        expect(formatted).toBe(expected);
        expect(result.current.timeError).toBe('');
      });
    });

    it('should reject invalid time formats', () => {
      const { result } = renderHook(() => useTimeLogValidation());
      const invalidInputs = ['', 'abc', '-1', '0', 'a1.5'];

      invalidInputs.forEach((input) => {
        let formatted: number | null = null;
        act(() => {
          formatted = result.current.validateAndFormatTime(input);
        });
        expect(formatted).toBeNull();
        expect(result.current.timeError).toBe(
          'Please enter a valid number of hours (e.g., 1, 1.5, 2)',
        );
      });
    });
  });

  describe('maximum', () => {
    it('accepts exactly MAX_LOG_HOURS and rejects more', () => {
      const { result } = renderHook(() => useTimeLogValidation());
      let formatted: number | null = null;

      act(() => {
        formatted = result.current.validateAndFormatTime(String(MAX_LOG_HOURS));
      });
      expect(formatted).toBe(MAX_LOG_HOURS);

      act(() => {
        formatted = result.current.validateAndFormatTime('24.5');
      });
      expect(formatted).toBeNull();
      expect(result.current.timeError).toBe(
        `Time spent cannot exceed ${MAX_LOG_HOURS} hours`,
      );
    });
  });

  describe('validateTime', () => {
    it('should return true for valid time inputs', () => {
      const { result } = renderHook(() => useTimeLogValidation());
      const validInputs = ['1', '1.5', '2.25', '0.5'];

      validInputs.forEach((input) => {
        let isValid: boolean = false;
        act(() => {
          isValid = result.current.validateTime(input);
        });
        expect(isValid).toBe(true);
      });
    });

    it('should return false for invalid time inputs', () => {
      const { result } = renderHook(() => useTimeLogValidation());
      const invalidInputs = ['', 'abc', '-1', '0', 'a1.5'];

      invalidInputs.forEach((input) => {
        let isValid: boolean = false;
        act(() => {
          isValid = result.current.validateTime(input);
        });
        expect(isValid).toBe(false);
      });
    });
  });
});
