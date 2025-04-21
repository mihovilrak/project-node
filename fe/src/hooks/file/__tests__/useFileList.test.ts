import { renderHook } from '@testing-library/react';
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
      expect(result.current.formatFileSize(921)).toBe('921 Bytes');
    });

    it('should format kilobytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      expect(result.current.formatFileSize(922)).toBe('0.9 KB');
      expect(result.current.formatFileSize(1023)).toBe('1.0 KB');
      expect(result.current.formatFileSize(1024)).toBe('1.0 KB');
      expect(result.current.formatFileSize(1536)).toBe('1.5 KB');
      expect(result.current.formatFileSize(1048575)).toBe('1024.0 KB');
    });

    it('should format megabytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const oneMB = 1024 * 1024;
      expect(result.current.formatFileSize(oneMB)).toBe('1.00 MB');
      expect(result.current.formatFileSize(2.5 * oneMB)).toBe('2.50 MB');
      expect(result.current.formatFileSize(1073741823)).toBe('1024.00 MB');
    });

    it('should format gigabytes correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      const oneGB = 1024 * 1024 * 1024;
      expect(result.current.formatFileSize(oneGB)).toBe('1.00 GB');
      expect(result.current.formatFileSize(2.5 * oneGB)).toBe('2.50 GB');
    });

    it('should handle boundary values correctly', () => {
      const { result } = renderHook(() => useFileList(mockOnFileDeleted));
      expect(result.current.formatFileSize(0)).toBe('0 Bytes');
      expect(result.current.formatFileSize(921)).toBe('921 Bytes');
      expect(result.current.formatFileSize(922)).toBe('0.9 KB');
      expect(result.current.formatFileSize(1023)).toBe('1.0 KB');
      expect(result.current.formatFileSize(1024)).toBe('1.0 KB');
      expect(result.current.formatFileSize(1048575)).toBe('1024.0 KB');
      expect(result.current.formatFileSize(1048576)).toBe('1.00 MB');
      expect(result.current.formatFileSize(1073741823)).toBe('1024.00 MB');
      expect(result.current.formatFileSize(1073741824)).toBe('1.00 GB');
    });
  });
});