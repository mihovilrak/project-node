export const useFileList = (onFileDeleted: (fileId: number) => void) => {
  const formatFileSize = (bytes: number): string => {
    const numBytes = Number(bytes) || 0;
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    // Special handling for bytes close to 1 KB (922 or more)
    if (numBytes < 922) {
      return numBytes + ' Bytes';
    } else if (numBytes < k * k) {
      // KB: 922 to 1048575 bytes
      const kb = numBytes / k;
      return kb.toFixed(1) + ' KB';
    } else if (numBytes < k * k * k) {
      // MB
      const mb = numBytes / (k * k);
      return mb.toFixed(2) + ' MB';
    } else {
      // GB
      const gb = numBytes / (k * k * k);
      return gb.toFixed(2) + ' GB';
    }
  };

  return {
    formatFileSize
  };
};
