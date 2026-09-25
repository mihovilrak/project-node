import { Request, Response } from 'express';
import { AVAILABLE_ICONS } from './iconConstants';

export const LOOKUP_TYPE_KEYS = [
  'name',
  'description',
  'color',
  'icon',
  'active',
] as const;

export type LookupTypeKey = (typeof LOOKUP_TYPE_KEYS)[number];
export type LookupTypeValues = Partial<Record<LookupTypeKey, unknown>>;

const MAX_NAME_LENGTH = 50;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const ICONS = new Set(AVAILABLE_ICONS);
const NAME_ERROR = `Name is required and must be at most ${MAX_NAME_LENGTH} characters`;
const COLOR_ERROR = 'Invalid color format';

const fieldError = (key: LookupTypeKey, value: unknown): string | null => {
  switch (key) {
    case 'name':
      return typeof value === 'string' &&
        value.trim() !== '' &&
        value.trim().length <= MAX_NAME_LENGTH
        ? null
        : NAME_ERROR;
    case 'color':
      return typeof value === 'string' && HEX_COLOR.test(value)
        ? null
        : COLOR_ERROR;
    case 'icon':
      return value === null || (typeof value === 'string' && ICONS.has(value))
        ? null
        : 'Invalid icon';
    case 'description':
      return value === null || typeof value === 'string'
        ? null
        : 'Invalid description';
    case 'active':
      return typeof value === 'boolean' ? null : 'Invalid active flag';
  }
};

/**
 * Validate a task/activity type body and keep only the known keys that were
 * sent.
 *
 * On create, `name` and `color` are required. Empty descriptions and icons
 * become null.
 */
export const parseLookupType = (
  body: unknown,
  mode: 'create' | 'update',
): { error: string } | { values: LookupTypeValues } => {
  const input = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const values: LookupTypeValues = {};

  for (const key of LOOKUP_TYPE_KEYS) {
    let value = input[key];
    if (value === undefined) continue;
    if ((key === 'description' || key === 'icon') && value === '') value = null;
    const error = fieldError(key, value);
    if (error) return { error };
    values[key] = key === 'name' ? (value as string).trim() : value;
  }

  if (mode === 'create') {
    if (values.name === undefined) return { error: NAME_ERROR };
    if (values.color === undefined) return { error: COLOR_ERROR };
  }
  return { values };
};

export const getAvailableIcons = (req: Request, res: Response): void => {
  res.status(200).json(AVAILABLE_ICONS);
};
