export const useFileList = (onFileDeleted: (fileId: number) => void) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    // For files close to or above 1MB, always show in MB
    if (bytes >= 900 * 1024) {
      const mbSize = bytes / (1024 * 1024);
      return mbSize.toFixed(2) + ' MB';
    }
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    formatFileSize
  };
};
