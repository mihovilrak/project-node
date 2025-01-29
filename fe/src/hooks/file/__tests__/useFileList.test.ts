import { renderHook } from '@testing-library/react-hooks';
import { useFileList } from '../useFileList';

describe('useFileList', () => {
  const mockOnFileDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatFileSize', () => {
    it('should format zero bytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      expect(result.current.formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      expect(result.current.formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const oneKB = 1024;
      expect(result.current.formatFileSize(oneKB)).toBe('1 KB');
      expect(result.current.formatFileSize(1.5 * oneKB)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const oneMB = 1024 * 1024;
      expect(result.current.formatFileSize(oneMB)).toBe('1 MB');
      expect(result.current.formatFileSize(2.5 * oneMB)).toBe('2.5 MB');
    });

    it('should format gigabytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const oneGB = 1024 * 1024 * 1024;
      expect(result.current.formatFileSize(oneGB)).toBe('1 GB');
      expect(result.current.formatFileSize(2.5 * oneGB)).toBe('2.5 GB');
    });

    it('should handle boundary values correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const almostKB = 1023;
      const almostMB = 1024 * 1024 - 1;
      expect(result.current.formatFileSize(almostKB)).toBe('1023 Bytes');
      expect(result.current.formatFileSize(almostMB)).toBe('1024 KB');
    });
  });
});