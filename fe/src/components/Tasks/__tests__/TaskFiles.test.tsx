import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskFiles from '../TaskFiles';
import { useTaskFiles } from '../../../hooks/task/useTaskFiles';
import { TaskFile } from '../../../types/file';

// Mock dependencies
jest.mock('../../../hooks/task/useTaskFiles');
jest.mock('../../Files/FileUpload', () => ({
  __esModule: true,
  default: ({ onFileUploaded }: { onFileUploaded: (file: TaskFile) => void }) => (
    <button
      onClick={() => onFileUploaded({
        id: 1,
        task_id: 1,
        name: 'test.txt',
        original_name: 'test.txt',
        mime_type: 'text/plain',
        size: 1000,
        user_id: 1,
        uploaded_on: '2023-01-01'
      })}
      data-testid="file-upload"
    >
      Upload File
    </button>
  )
}));

jest.mock('../../Files/FileList', () => ({
  __esModule: true,
  default: ({ files, onFileDeleted }: { files: TaskFile[], onFileDeleted: (id: number) => void }) => (
    <div data-testid="file-list">
      {files.map(file => (
        <div key={file.id}>
          {file.original_name}
          <button onClick={() => onFileDeleted(file.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}));

const mockFiles: TaskFile[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    name: 'test1.txt',
    original_name: 'test1.txt',
    mime_type: 'text/plain',
    size: 1000,
    uploaded_on: '2023-01-01'
  },
  {
    id: 2,
    task_id: 1,
    user_id: 1,
    name: 'test2.txt',
    original_name: 'test2.txt',
    mime_type: 'text/plain',
    size: 2000,
    uploaded_on: '2023-01-02'
  }
];

const mockRefreshFiles = jest.fn();

describe('TaskFiles', () => {
  beforeEach(() => {
    (useTaskFiles as jest.Mock).mockReturnValue({
      files: mockFiles,
      refreshFiles: mockRefreshFiles
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with files', () => {
    render(
      <TaskFiles
        taskId={1}
        onFileUploaded={jest.fn()}
        onFileDeleted={jest.fn()}
      />
    );

    expect(screen.getByText('Files (2)')).toBeInTheDocument();
    expect(screen.getByTestId('file-list')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('handles file upload correctly', async () => {
    const onFileUploaded = jest.fn();
    render(
      <TaskFiles
        taskId={1}
        onFileUploaded={onFileUploaded}
        onFileDeleted={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('file-upload'));

    await waitFor(() => {
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(onFileUploaded).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        task_id: 1,
        name: 'test.txt'
      }));
    });
  });

  it('handles file deletion correctly', async () => {
    const onFileDeleted = jest.fn();
    render(
      <TaskFiles
        taskId={1}
        onFileUploaded={jest.fn()}
        onFileDeleted={onFileDeleted}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockRefreshFiles).toHaveBeenCalled();
      expect(onFileDeleted).toHaveBeenCalledWith(mockFiles[0].id);
    });
  });

  it('displays correct number of files', () => {
    (useTaskFiles as jest.Mock).mockReturnValue({
      files: [],
      refreshFiles: mockRefreshFiles
    });

    render(
      <TaskFiles
        taskId={1}
        onFileUploaded={jest.fn()}
        onFileDeleted={jest.fn()}
      />
    );

    expect(screen.getByText('Files (0)')).toBeInTheDocument();
  });

  it('passes correct props to child components', () => {
    const taskId = 1;
    render(
      <TaskFiles
        taskId={taskId}
        onFileUploaded={jest.fn()}
        onFileDeleted={jest.fn()}
      />
    );

    expect(useTaskFiles).toHaveBeenCalledWith(String(taskId));
    expect(screen.getByTestId('file-list')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });
});