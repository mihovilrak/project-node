import {
  formatFileSize,
  safeDecodeFileName,
  getFileNameFromContentDisposition,
} from '../fileUtils';

describe('formatFileSize', () => {
  it('formats zero and plain bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(921)).toBe('921 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(922)).toBe('0.9 KB');
    expect(formatFileSize(1023)).toBe('1.0 KB');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048575)).toBe('1024.0 KB');
  });

  it('formats megabytes', () => {
    const oneMB = 1024 * 1024;
    expect(formatFileSize(oneMB)).toBe('1.00 MB');
    expect(formatFileSize(2.5 * oneMB)).toBe('2.50 MB');
    expect(formatFileSize(1073741823)).toBe('1024.00 MB');
  });

  it('formats gigabytes', () => {
    const oneGB = 1024 * 1024 * 1024;
    expect(formatFileSize(oneGB)).toBe('1.00 GB');
    expect(formatFileSize(2.5 * oneGB)).toBe('2.50 GB');
  });

  it('treats non-numeric input as zero', () => {
    expect(formatFileSize(Number.NaN)).toBe('0 Bytes');
  });
});

describe('safeDecodeFileName', () => {
  it('repairs latin1-encoded UTF-8 names', () => {
    expect(safeDecodeFileName('Ã¼ber.txt')).toBe('über.txt');
  });

  it('returns names that cannot be decoded unchanged', () => {
    expect(safeDecodeFileName('100%.txt')).toBe('100%.txt');
  });
});

describe('getFileNameFromContentDisposition', () => {
  it('falls back when the header is missing', () => {
    expect(getFileNameFromContentDisposition(undefined)).toBe('download');
  });

  it('reads a quoted filename', () => {
    expect(
      getFileNameFromContentDisposition('attachment; filename="test.txt"'),
    ).toBe('test.txt');
  });

  it('prefers the RFC 5987 filename* parameter', () => {
    expect(
      getFileNameFromContentDisposition(
        `attachment; filename="fallback.txt"; filename*=UTF-8''%C3%BCber%20plan.pdf`,
      ),
    ).toBe('über plan.pdf');
  });

  it('does not throw on malformed percent-encoding', () => {
    expect(
      getFileNameFromContentDisposition('attachment; filename="50%off.txt"'),
    ).toBe('50%off.txt');
  });
});
