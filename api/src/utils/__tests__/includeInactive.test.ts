import { Pool } from 'pg';
import { includeInactive } from '../includeInactive';
import { hasPermission } from '../../models/permissionModel';

jest.mock('../../models/permissionModel');

const mockHasPermission = hasPermission as jest.Mock;
const pool = {} as Pool;
const req = (query: Record<string, string>, userId?: string) =>
  ({
    query,
    session: userId ? { user: { id: userId } } : undefined,
  }) as any;

describe('includeInactive', () => {
  beforeEach(() => mockHasPermission.mockReset());

  it('is false without the flag and skips the permission check', async () => {
    await expect(includeInactive(req({}, '1'), pool)).resolves.toBe(false);
    expect(mockHasPermission).not.toHaveBeenCalled();
  });

  it('is false for any value other than "true"', async () => {
    await expect(
      includeInactive(req({ include_inactive: '1' }, '1'), pool),
    ).resolves.toBe(false);
  });

  it('is true for an admin', async () => {
    mockHasPermission.mockResolvedValue(true);
    await expect(
      includeInactive(req({ include_inactive: 'true' }, '1'), pool),
    ).resolves.toBe(true);
    expect(mockHasPermission).toHaveBeenCalledWith(pool, '1', 'Admin');
  });

  it('is false for a non-admin', async () => {
    mockHasPermission.mockResolvedValue(false);
    await expect(
      includeInactive(req({ include_inactive: 'true' }, '2'), pool),
    ).resolves.toBe(false);
  });

  it('rejects with 401 without a session', async () => {
    await expect(
      includeInactive(req({ include_inactive: 'true' }), pool),
    ).rejects.toMatchObject({ status: 401 });
    expect(mockHasPermission).not.toHaveBeenCalled();
  });
});
