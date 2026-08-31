import { ProjectFilters, ProjectQueryFilters } from '../types/project';

const numberValue = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

export const mapProjectQueryFilters = (
  query: ProjectQueryFilters,
): ProjectFilters => {
  let source: Record<string, unknown> = { ...query };
  if (query.whereParams) {
    source =
      typeof query.whereParams === 'string'
        ? (JSON.parse(query.whereParams) as Record<string, unknown>)
        : query.whereParams;
  }

  return {
    statusId: numberValue(source.status_id),
    createdBy: numberValue(source.created_by),
    parentId: numberValue(source.parent_id),
    startDateFrom: stringValue(source.start_date_from),
    startDateTo: stringValue(source.start_date_to),
    dueDateFrom: stringValue(source.due_date_from),
    dueDateTo: stringValue(source.due_date_to),
  };
};
