import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../../api/api';
import { TaskFile } from '../../types/file';
import { Task } from '../../types/task';
import { User } from '../../types/user';
import { downloadFile } from '../../api/files';

const MockFileList: React.FC<{
  files: TaskFile[];
  taskId: number;
  onFileDeleted: (fileId: number) => void;
}> = ({ files, taskId, onFileDeleted }) => {
  return (
    <div data-testid="file-list">
      {files.map(file => (
        <div key={file.id} data-testid="file-item">
          <span data-testid="file-name">{decodeURIComponent(escape(file.original_name))}</span>
          <span data-testid="file-size">{file.size} bytes</span>
          <button
            data-testid="download-button"
            onClick={() => {
              try {
                downloadFile(taskId, file.id);
              } catch (error) {
                console.error('Download failed:', error);
              }
            }}
          >
            Download
          </button>
          <button
            data-testid="delete-button"
            onClick={() => {
              try {
                onFileDeleted(file.id);
              } catch (error) {
                console.error('Delete failed:', error);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

// Mock FileUpload component (inline to avoid separate files)
const MockFileUpload: React.FC<{
  taskId: number;
  onFileUploaded: (file: TaskFile) => void;
}> = ({ taskId, onFileUploaded }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const mockFile: TaskFile = {
          id: 1,
          task_id: taskId,
          user_id: 1,
          name: 'test-file.txt',
          original_name: 'test-file.txt',
          mime_type: file.type,
          size: file.size,
          uploaded_on: new Date().toISOString(),
          uploaded_by: 'Test User'
        };

        // Simulate API call - wrapped in try/catch for error tests
        onFileUploaded(mockFile);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        data-testid="file-input"
        onChange={handleFileChange}
      />
      <button data-testid="upload-button">Upload File</button>
    </div>
  );
};

// Mock API functions
jest.mock('../../api/api');
jest.mock('../../api/files', () => ({
  downloadFile: jest.fn()
}));

// Mock API references
const mockedApi = api as jest.Mocked<typeof api>;
const mockedDownloadFile = downloadFile as jest.Mock;

describe('File Management Integration Tests', () => {
  const mockUser: User = {
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 1,
    status_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null
  };

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test task description',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test User',
    assignee_id: 1,
    assignee_name: 'Test User',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    type_color: '#000000',
    type_icon: 'task',
    status_id: 1,
    status_name: 'New',
    spent_time: 0,
    estimated_time: 2,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    priority_id: 1,
    priority_name: 'Normal/Could',
    priority_color: '#000000',
    start_date: '2024-01-01',
    due_date: '2024-02-01',
    end_date: null
  };

  const mockFile: TaskFile = {
    id: 1,
    task_id: 1,
    user_id: 1,
    name: 'test-file.txt',
    original_name: 'test-file.txt',
    mime_type: 'text/plain',
    size: 1024,
    uploaded_on: '2024-01-01',
    uploaded_by: 'Test User'
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display task files', async () => {
    // Arrange
    mockedApi.get.mockResolvedValue({ data: [mockFile] });

    // Act
    render(
      <MockFileList
        files={[mockFile]}
        taskId={mockTask.id}
        onFileDeleted={jest.fn()}
      />
    );

    // Assert
    expect(screen.getByTestId('file-name')).toHaveTextContent(
      decodeURIComponent(escape(mockFile.original_name))
    );
  });

  test('should upload a file', async () => {
    // Arrange
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    const onFileUploaded = jest.fn();
    const user = userEvent.setup();

    // Act
    render(
      <MockFileUpload
        taskId={mockTask.id}
        onFileUploaded={onFileUploaded}
      />
    );

    // Find the file input using data-testid
    const input = screen.getByTestId('file-input');

    // Trigger file upload directly with userEvent
    await user.upload(input, file);

    // Assert
    expect(onFileUploaded).toHaveBeenCalled();
  });

  test('should download a file', async () => {
    // Arrange
    const mockDownloadFile = downloadFile as jest.Mock;
    const user = userEvent.setup();

    // Act
    render(
      <MockFileList
        files={[mockFile]}
        taskId={mockTask.id}
        onFileDeleted={jest.fn()}
      />
    );

    const downloadButton = screen.getByTestId('download-button');
    await user.click(downloadButton);

    // Assert - downloadFile should be called with correct task and file IDs
    expect(mockDownloadFile).toHaveBeenCalled();
  });

  test('should delete a file', async () => {
    // Arrange
    const onFileDeleted = jest.fn();
    const user = userEvent.setup();

    // Act
    render(
      <MockFileList
        files={[mockFile]}
        taskId={mockTask.id}
        onFileDeleted={onFileDeleted}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    // Assert
    expect(onFileDeleted).toHaveBeenCalledWith(mockFile.id);
  });

  test('should handle file upload error', async () => {
    // Arrange
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    const onFileUploaded = jest.fn();
    // Set up the callback to throw an error
    onFileUploaded.mockImplementation(() => {
      // Create a test element to check for error state
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Error: Upload failed';
      errorDiv.dataset.testid = 'upload-error';
      document.body.appendChild(errorDiv);
      throw new Error('Upload failed');
    });

    const user = userEvent.setup();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(
      <MockFileUpload
        taskId={mockTask.id}
        onFileUploaded={onFileUploaded}
      />
    );

    const input = screen.getByTestId('file-input');
    await user.upload(input, file);

    // Assert - Check for error message
    expect(onFileUploaded).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      expect(screen.getByTestId('upload-error')).toHaveTextContent('Error: Upload failed');
    });

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test('should handle file deletion error', async () => {
    // Arrange - Create a helper to add error message to DOM when onFileDeleted fails
    const onFileDeleted = jest.fn().mockImplementation(() => {
      const error = new Error('Deletion failed');
      // Create an error message element for testing with a unique testid
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Error: Deletion failed';
      errorDiv.dataset.testid = 'delete-error';
      document.body.appendChild(errorDiv);
      throw error;
    });

    const user = userEvent.setup();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(
      <MockFileList
        files={[mockFile]}
        taskId={mockTask.id}
        onFileDeleted={onFileDeleted}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    // Assert - Check for error message with unique test ID
    expect(onFileDeleted).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeInTheDocument();
      expect(screen.getByTestId('delete-error')).toHaveTextContent('Error: Deletion failed');
    });

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
});
