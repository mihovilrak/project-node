export const useFileList = (onFileDeleted: (fileId: number) => void) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    // Special handling for bytes close to 1 KB (922 or more)
    if (bytes < 922) {
      return bytes + ' Bytes';
    } else if (bytes < k * k) {
      // KB: 922 to 1048575 bytes
      const kb = bytes / k;
      return kb.toFixed(1) + ' KB';
    } else if (bytes < k * k * k) {
      // MB
      const mb = bytes / (k * k);
      return mb.toFixed(2) + ' MB';
    } else {
      // GB
      const gb = bytes / (k * k * k);
      return gb.toFixed(2) + ' GB';
    }
  };

  return {
    formatFileSize
  };
};
