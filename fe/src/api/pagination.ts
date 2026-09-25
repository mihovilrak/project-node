// Server-side maximum for ?limit= on list endpoints (the default is 50).
export const PAGE_SIZE = 500;

export interface PageParams {
  limit: number;
  offset: number;
}

/**
 * Collect every row of a paginated list endpoint by requesting pages until one
 * comes back short.
 *
 * @param fetchPage Fetches one page for the given limit and offset.
 */
export const fetchAllPages = async <T>(
  fetchPage: (page: PageParams) => Promise<T[] | null | undefined>,
): Promise<T[]> => {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (await fetchPage({ limit: PAGE_SIZE, offset })) ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
};
