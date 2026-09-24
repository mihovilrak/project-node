const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

export interface UpdateAssignments {
  columns: string[];
  setClause: string;
  values: unknown[];
  nextIndex: number;
}

/**
 * Construct a parameterized SQL UPDATE clause from a record of updates filtered against allowed columns.
 * @param updates A record of column names to values to apply, or null/undefined if no updates are provided.
 * @param allowedColumns A whitelist of column names that are permitted to be updated.
 * @param startIndex The starting parameter index for placeholders in the generated SQL clause, defaults to 1.
 * @returns An object containing the filtered columns, a parameterized SET clause, corresponding values, and the next available parameter index, or null if no updates matched the allowed columns.
 */
export const buildUpdateAssignments = (
  updates: Record<string, unknown> | undefined | null,
  allowedColumns: readonly string[],
  startIndex = 1,
): UpdateAssignments | null => {
  const columns: string[] = [];
  const values: unknown[] = [];

  for (const column of allowedColumns) {
    if (!IDENTIFIER.test(column)) {
      throw new Error(`Unsafe column name in whitelist: ${column}`);
    }
    if (!updates || !Object.prototype.hasOwnProperty.call(updates, column)) {
      continue;
    }
    const value = updates[column];
    if (value === undefined) continue;
    columns.push(column);
    values.push(value);
  }

  if (columns.length === 0) return null;

  return {
    columns,
    setClause: columns
      .map((column, index) => `${column} = $${index + startIndex}`)
      .join(', '),
    values,
    nextIndex: startIndex + columns.length,
  };
};
