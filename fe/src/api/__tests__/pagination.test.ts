import { PAGE_SIZE, fetchAllPages } from '../pagination';

describe('fetchAllPages', () => {
  it('stops after a short first page', async () => {
    const fetchPage = jest.fn().mockResolvedValue([1, 2]);

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([1, 2]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith({ limit: PAGE_SIZE, offset: 0 });
  });

  it('keeps paging while pages are full', async () => {
    const full = Array.from({ length: PAGE_SIZE }, (_, i) => i);
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce([]);

    const rows = await fetchAllPages(fetchPage);

    expect(rows).toHaveLength(PAGE_SIZE * 2);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenLastCalledWith({
      limit: PAGE_SIZE,
      offset: PAGE_SIZE * 2,
    });
  });

  it('treats a null page as empty', async () => {
    const fetchPage = jest.fn().mockResolvedValue(null);

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([]);
  });

  it('propagates errors', async () => {
    const fetchPage = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(fetchAllPages(fetchPage)).rejects.toThrow('boom');
  });
});
