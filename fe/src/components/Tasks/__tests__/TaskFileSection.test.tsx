import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskFileSection from '../TaskFileSection';
import { useTaskFiles } from '../../../hooks/task/useTaskFiles';
import { MemoryRouter } from 'react-router-dom';

// Mock the dependencies
jest.mock('../../../hooks/task/useTaskFiles');
jest.mock('../../Files/FileUpload', () => ({
  __esModule: true,
  default: ({ onFileUploaded }: { onFileUploaded: (file: any) => void }) => (
    <button onClick={() => onFileUploaded({ id: 1, name: 'test.txt' })}>
      Upload File
    </button>
  ),
}));

jest.mock('../../Files/FileList', () => ({
  __esModule: true,
  default: ({ files, onFileDeleted }: { files: any[], onFileDeleted: (id: number) => void }) => (
    <div>
      <span>File Count: {files.length}</span>
      {files.map(file => (
        <div key={file.id}>
          <span>{file.name}</span>
          <button onClick={() => onFileDeleted(file.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

describe('TaskFileSection', () => {
  const mockRefreshFiles = jest.fn();
  const mockOnFileUploaded = jest.fn();
  const mockOnFileDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTaskFiles as jest.Mock).mockReturnValue({
      refreshFiles: mockRefreshFiles,
    });
  });

  const defaultProps = {
    taskId: 1,
    files: [
      {
        id: 1,
        task_id: 1,
        name: 'test1.txt',
        original_name: 'test1.txt',
        user_id: 1,
        uploaded_by: 'User 1',
        mime_type: 'text/plain',
        size: 1024,
        uploaded_on: '2024-03-20T12:00:00Z'
      },
      {
        id: 2,
        task_id: 1,
        name: 'test2.txt',
        original_name: 'test2.txt',
        user_id: 2,
        uploaded_by: 'User 2',
        mime_type: 'text/plain',
        size: 2048,
        uploaded_on: '2024-03-20T12:00:00Z'
      },
    ],
    onFileUploaded: mockOnFileUploaded,
    onFileDeleted: mockOnFileDeleted,
  };

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <TaskFileSection {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('renders correctly with files', () => {
    renderComponent();
    
    expect(screen.getByText('Files (2)')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('File Count: 2')).toBeInTheDocument();
  });

  it('renders correctly with no files', () => {
    renderComponent({ files: [] });
    
    expect(screen.getByText('Files (0)')).toBeInTheDocument();
    expect(screen.getByText('File Count: 0')).toBeInTheDocument();
  });

  it('handles file upload correctly', async () => {
    renderComponent();
    
    const uploadButton = screen.getByText('Upload File');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(mockOnFileUploaded).toHaveBeenCalledWith({
        id: 1,
        name: 'test.txt'
      });
    });
  });

  it('handles file deletion correctly', async () => {
    renderComponent();
    
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(mockOnFileDeleted).toHaveBeenCalledWith(1);
    });
  });

  it('initializes useTaskFiles with correct taskId', () => {
    renderComponent();
    
    expect(useTaskFiles).toHaveBeenCalledWith('1');
  });

  it('handles callbacks even when they are not provided', async () => {
    renderComponent({
      onFileUploaded: undefined,
      onFileDeleted: undefined,
    });
    
    const uploadButton = screen.getByText('Upload File');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockRefreshFiles).toHaveBeenCalled();
    });
  });
});