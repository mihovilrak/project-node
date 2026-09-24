/**
 * Format a byte count as a human-readable size (Bytes, KB, MB or GB).
 */
export const formatFileSize = (bytes: number): string => {
  const numBytes = Number(bytes) || 0;
  if (numBytes === 0) return '0 Bytes';
  const k = 1024;
  // Values from 922 bytes upward round to at least 0.9 KB.
  if (numBytes < 922) return numBytes + ' Bytes';
  if (numBytes < k * k) return (numBytes / k).toFixed(1) + ' KB';
  if (numBytes < k * k * k) return (numBytes / (k * k)).toFixed(2) + ' MB';
  return (numBytes / (k * k * k)).toFixed(2) + ' GB';
};

/**
 * Decode a stored file name. Names stored as latin1-encoded UTF-8 bytes are
 * repaired; anything that fails to decode is returned unchanged.
 */
export const safeDecodeFileName = (name: string): string => {
  try {
    return decodeURIComponent(escape(name));
  } catch {
    return name;
  }
};

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Extract the file name from a Content-Disposition header, preferring the RFC
 * 5987 `filename*` parameter over plain `filename`.
 */
export const getFileNameFromContentDisposition = (
  header: string | null | undefined,
  fallback = 'download',
): string => {
  if (!header) return fallback;

  const extended = /filename\*\s*=\s*([^;]+)/i.exec(header);
  if (extended) {
    const value = extended[1].trim().replace(/^"(.*)"$/, '$1');
    const encoded = value.replace(/^[^']*'[^']*'/, '');
    const decoded = safeDecodeURIComponent(encoded).trim();
    if (decoded) return decoded;
  }

  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(header);
  if (plain) {
    const value = (plain[2] ?? plain[1]).trim();
    const decoded = safeDecodeURIComponent(value).trim();
    if (decoded) return decoded;
  }

  return fallback;
};
