import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectMembers } from '../useProjectMembers';
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../../../api/projects';
import { ProjectMember } from '../../../types/project';

jest.mock('../../../api/projects');

describe('useProjectMembers', () => {
  const mockMembers: ProjectMember[] = [
    {
      project_id: 1,
      user_id: 1,
      created_on: '2024-01-01',
      name: 'John',
      surname: 'Doe',
      role: 'Developer',
    },
    {
      project_id: 1,
      user_id: 2,
      created_on: '2024-01-01',
      name: 'Jane',
      surname: 'Smith',
      role: 'Project Manager',
    },
  ];
  const newMember: ProjectMember = {
    project_id: 1,
    user_id: 3,
    created_on: '2024-01-01',
    name: 'Bob',
    surname: 'Johnson',
    role: 'Developer',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getProjectMembers as jest.Mock).mockResolvedValue(mockMembers);
  });

  const renderLoaded = async () => {
    const hook = renderHook(() => useProjectMembers('1'));
    await waitFor(() =>
      expect(hook.result.current.members).toEqual(mockMembers),
    );
    return hook;
  };

  it('fetches project members on mount', async () => {
    await renderLoaded();

    expect(getProjectMembers).toHaveBeenCalledTimes(1);
    expect(getProjectMembers).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  });

  it('removes a member with a single DELETE', async () => {
    (removeProjectMember as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleMemberRemove(1);
    });

    expect(removeProjectMember).toHaveBeenCalledTimes(1);
    expect(removeProjectMember).toHaveBeenCalledWith(1, 1);
    expect(result.current.members).toEqual([mockMembers[1]]);
  });

  it('throws the API message when removal fails', async () => {
    (removeProjectMember as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Not allowed' } },
    });
    const { result } = await renderLoaded();

    await expect(result.current.handleMemberRemove(1)).rejects.toThrow(
      'Not allowed',
    );
    expect(result.current.members).toEqual(mockMembers);
  });

  it('adds and removes only the changed members, then reloads', async () => {
    (addProjectMember as jest.Mock).mockResolvedValue(newMember);
    (removeProjectMember as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderLoaded();
    (getProjectMembers as jest.Mock).mockResolvedValue([
      mockMembers[1],
      newMember,
    ]);

    await act(async () => {
      await result.current.handleMembersUpdate([2, 3]);
    });

    expect(removeProjectMember).toHaveBeenCalledTimes(1);
    expect(removeProjectMember).toHaveBeenCalledWith(1, 1);
    expect(addProjectMember).toHaveBeenCalledTimes(1);
    expect(addProjectMember).toHaveBeenCalledWith(1, 3);
    expect(result.current.members).toEqual([mockMembers[1], newMember]);
  });

  it('skips requests when the selection is unchanged', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleMembersUpdate([1, 2]);
    });

    expect(addProjectMember).not.toHaveBeenCalled();
    expect(removeProjectMember).not.toHaveBeenCalled();
    expect(getProjectMembers).toHaveBeenCalledTimes(1);
  });

  it('rejects and reloads when an update fails', async () => {
    (addProjectMember as jest.Mock).mockRejectedValue(new Error('boom'));
    const { result } = await renderLoaded();

    let caught: unknown;
    await act(async () => {
      await result.current.handleMembersUpdate([1, 2, 3]).catch((err) => {
        caught = err;
      });
    });

    expect((caught as Error).message).toBe('boom');
    expect(getProjectMembers).toHaveBeenCalledTimes(2);
  });

  it('toggles the manage members dialog', async () => {
    const { result } = await renderLoaded();

    act(() => {
      result.current.setManageMembersOpen(true);
    });
    expect(result.current.manageMembersOpen).toBe(true);

    act(() => {
      result.current.setManageMembersOpen(false);
    });
    expect(result.current.manageMembersOpen).toBe(false);
  });
});
