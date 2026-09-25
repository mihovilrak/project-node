import { Request, Response } from 'express';
import { AVAILABLE_ICONS } from '../iconConstants';
import { getAvailableIcons, parseLookupType } from '../lookupType';

describe('parseLookupType', () => {
  it('keeps only known keys that were sent and trims the name', () => {
    expect(
      parseLookupType(
        { name: '  Bug ', color: '#FF0000', extra: 1, created_on: 'x' },
        'create',
      ),
    ).toEqual({ values: { name: 'Bug', color: '#FF0000' } });
  });

  it('turns empty description and icon into null', () => {
    expect(parseLookupType({ description: '', icon: '' }, 'update')).toEqual({
      values: { description: null, icon: null },
    });
  });

  it('accepts active false on update', () => {
    expect(parseLookupType({ active: false }, 'update')).toEqual({
      values: { active: false },
    });
  });

  it('returns empty values for an empty update', () => {
    expect(parseLookupType(undefined, 'update')).toEqual({ values: {} });
  });

  it.each([
    [{ color: '#FF0000' }, 'create'],
    [{ name: 'Bug' }, 'create'],
    [{ name: '   ', color: '#FF0000' }, 'create'],
    [{ name: 'x'.repeat(51) }, 'update'],
    [{ name: 5 }, 'update'],
    [{ color: 'red' }, 'update'],
    [{ color: null }, 'update'],
    [{ icon: 'NotAnIcon' }, 'update'],
    [{ description: 3 }, 'update'],
    [{ active: 'yes' }, 'update'],
  ] as const)('rejects invalid body #%# on %s', (body, mode) => {
    expect(parseLookupType(body, mode)).toHaveProperty('error');
  });

  it('accepts every available icon', () => {
    for (const icon of AVAILABLE_ICONS) {
      expect(parseLookupType({ icon }, 'update')).toEqual({
        values: { icon },
      });
    }
  });
});

describe('getAvailableIcons', () => {
  it('returns the icon list', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    getAvailableIcons({} as Request, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(AVAILABLE_ICONS);
  });

  it('has no duplicates', () => {
    expect(new Set(AVAILABLE_ICONS).size).toBe(AVAILABLE_ICONS.length);
  });
});
