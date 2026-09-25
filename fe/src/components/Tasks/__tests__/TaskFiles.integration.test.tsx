import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskFiles from '../TaskFiles';
import { getTaskFiles, deleteFile } from '../../../api/files';
import { TaskFile } from '../../../types/file';

jest.mock('../../../api/files');

const files: TaskFile[] = [
  {
    id: 1,
    task_id: 7,
    user_id: 1,
    name: 'a.txt',
    original_name: 'a.txt',
    mime_type: 'text/plain',
    size: 10,
    uploaded_on: '2024-01-25T00:00:00Z',
  },
  {
    id: 2,
    task_id: 7,
    user_id: 1,
    name: 'b.txt',
    original_name: 'b.txt',
    mime_type: 'text/plain',
    size: 20,
    uploaded_on: '2024-01-25T00:00:00Z',
  },
];

const renderFiles = (onFileDeleted = jest.fn()) =>
  render(
    <MemoryRouter>
      <TaskFiles taskId={7} onFileDeleted={onFileDeleted} />
    </MemoryRouter>,
  );

describe('TaskFiles with the real hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskFiles as jest.Mock).mockResolvedValue(files);
    (deleteFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('deletes a file with one request and no list refetch', async () => {
    const onFileDeleted = jest.fn();
    renderFiles(onFileDeleted);
    await screen.findByText('a.txt');

    fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);

    await waitFor(() =>
      expect(screen.queryByText('a.txt')).not.toBeInTheDocument(),
    );
    expect(deleteFile).toHaveBeenCalledTimes(1);
    expect(deleteFile).toHaveBeenCalledWith(7, 1);
    expect(getTaskFiles).toHaveBeenCalledTimes(1);
    expect(onFileDeleted).toHaveBeenCalledWith(1);
    expect(screen.getByText('Files (1)')).toBeInTheDocument();
  });

  it('shows the API message when a delete is forbidden', async () => {
    (deleteFile as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    const onFileDeleted = jest.fn();
    renderFiles(onFileDeleted);
    await screen.findByText('a.txt');

    fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);

    expect(
      await screen.findByText(
        'You do not have permission to perform this action',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(onFileDeleted).not.toHaveBeenCalled();
  });
});
