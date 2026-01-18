import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FileList from '../FileList';
import { downloadFile } from '../../../api/files';
import type { TaskFile } from '../../../types/file';

// Mock the download file function
jest.mock('../../../api/files', () => ({
  downloadFile: jest.fn()
}));

const mockFiles: TaskFile[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    name: 'test-file.pdf',
    original_name: 'test file.pdf',
    mime_type: 'application/pdf',
    size: 1024576, // 1MB
    uploaded_on: '2024-01-01T00:00:00Z',
    uploaded_by: 'John Doe'
  }
];

const defaultProps = {
  files: mockFiles,
  taskId: 1,
  onFileDeleted: jest.fn()
};

const renderFileList = (props = {}) => {
  return render(
    <BrowserRouter>
      <FileList {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('FileList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays "No files uploaded yet" when files array is empty', () => {
    renderFileList({ files: [] });
    expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
  });

  it('renders file list with correct file information', () => {
    renderFileList();
    expect(screen.getByText('test file.pdf')).toBeInTheDocument();
    const fileSizeElement = screen.getByTestId('file-size');
    expect(fileSizeElement.textContent).toBe('1000.6 KB');
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Uploaded on:/)).toBeInTheDocument();
  });

  it('calls downloadFile when download button is clicked', () => {
    renderFileList();
    const downloadButton = screen.getByLabelText('download');
    fireEvent.click(downloadButton);
    expect(downloadFile).toHaveBeenCalledWith(1, 1);
  });

  it('calls onFileDeleted when delete button is clicked', () => {
    renderFileList();
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(defaultProps.onFileDeleted).toHaveBeenCalledWith(1);
  });

  it('renders download and delete tooltips', () => {
    renderFileList();
    expect(screen.getByLabelText('download')).toBeInTheDocument();
    expect(screen.getByLabelText('delete')).toBeInTheDocument();
  });

  it('renders file icon', () => {
    renderFileList();
    // MUI icons are rendered as SVG elements
    const fileIcon = document.querySelector('svg');
    expect(fileIcon).toBeInTheDocument();
  });

  it('renders user link with correct href', () => {
    renderFileList();
    const userLink = screen.getByText('John Doe');
    expect(userLink.closest('a')).toHaveAttribute('href', '/users/1');
  });

  it('properly formats file names with special characters', () => {
    const filesWithSpecialChars: TaskFile[] = [{
      ...mockFiles[0],
      name: 'test%20file%20with%20spaces.pdf',
      original_name: 'test file with spaces.pdf'
    }];
    renderFileList({ files: filesWithSpecialChars });
    expect(screen.getByText('test file with spaces.pdf')).toBeInTheDocument();
  });
});