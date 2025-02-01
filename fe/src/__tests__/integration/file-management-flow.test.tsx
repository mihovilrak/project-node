import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { api } from '../../api/api';
import { TaskFile } from '../../types/file';
import { Task } from '../../types/task';
import { User } from '../../types/user';
import FileList from '../../components/Files/FileList';
import FileUpload from '../../components/Files/FileUpload';
import React from 'react';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display task files', async () => {
    mockedApi.get.mockResolvedValue({ data: [mockFile] });

    render(
      <TestWrapper>
        <FileList files={[mockFile]} taskId={mockTask.id} onFileDeleted={jest.fn()} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
    });
  });

  test('should upload a file', async () => {
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    mockedApi.post.mockResolvedValue({ data: mockFile });

    const onFileUploaded = jest.fn();
    render(
      <TestWrapper>
        <FileUpload taskId={mockTask.id} onFileUploaded={onFileUploaded} />
      </TestWrapper>
    );

    const input = screen.getByLabelText(/upload file/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalled();
      expect(onFileUploaded).toHaveBeenCalledWith(mockFile);
    });
  });

  test('should download a file', async () => {
    // Mock window.URL methods
    const mockUrl = 'blob:test';
    const createObjectURL = jest.fn(() => mockUrl);
    const revokeObjectURL = jest.fn();
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    // Mock document methods
    const mockLink = {
      href: '',
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    };
    const createElement = jest.spyOn(document, 'createElement').mockImplementation(() => mockLink as any);
    const appendChild = jest.spyOn(document.body, 'appendChild').mockImplementation();

    // Mock API response
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    mockedApi.get.mockResolvedValue({
      data: mockBlob,
      headers: {
        'content-disposition': 'attachment; filename="test-file.txt"'
      }
    });

    render(
      <TestWrapper>
        <FileList files={[mockFile]} taskId={mockTask.id} onFileDeleted={jest.fn()} />
      </TestWrapper>
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(`/files/${mockFile.id}/download`, {
        params: { taskId: mockTask.id.toString() },
        responseType: 'blob'
      });
      expect(createObjectURL).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-file.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    // Cleanup
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    createElement.mockRestore();
    appendChild.mockRestore();
  });

  test('should delete a file', async () => {
    mockedApi.delete.mockResolvedValue({ data: {} });
    const onFileDeleted = jest.fn();

    render(
      <TestWrapper>
        <FileList files={[mockFile]} taskId={mockTask.id} onFileDeleted={onFileDeleted} />
      </TestWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(onFileDeleted).toHaveBeenCalledWith(mockFile.id);
    });
  });

  test('should handle file upload error', async () => {
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    const errorMessage = 'Upload failed';
    mockedApi.post.mockRejectedValue(new Error(errorMessage));

    const onFileUploaded = jest.fn();
    render(
      <TestWrapper>
        <FileUpload taskId={mockTask.id} onFileUploaded={onFileUploaded} />
      </TestWrapper>
    );

    const input = screen.getByLabelText(/upload file/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('should handle file deletion error', async () => {
    const errorMessage = 'Deletion failed';
    mockedApi.delete.mockRejectedValue(new Error(errorMessage));
    const onFileDeleted = jest.fn();

    render(
      <TestWrapper>
        <FileList files={[mockFile]} taskId={mockTask.id} onFileDeleted={onFileDeleted} />
      </TestWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
