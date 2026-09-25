import fs from 'fs';
import path from 'path';
import express from 'express';
import { parse } from 'yaml';

jest.mock('../db', () => ({ pool: {} }));
// uuid is ESM-only and the unit config does not transform node_modules.
jest.mock('uuid', () => ({ v4: () => 'uuid' }));
jest.mock('../middleware/sessionMiddleware', () => ({
  __esModule: true,
  default: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const SPEC_PATH = path.resolve(__dirname, '../../../docs/api/openapi.yaml');
const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'options',
  'head',
];

interface Layer {
  mountPath?: string;
  route?: { path: string; methods: Record<string, boolean> };
  handle: { stack?: Layer[] };
}

type UseFn = (this: { stack: Layer[] }, ...args: unknown[]) => unknown;

// Express 5 layers keep only a compiled matcher, so record each mount path as it is registered.
const routerProto = Object.getPrototypeOf(
  Object.getPrototypeOf(express.Router()),
) as { use: UseFn };
const originalUse = routerProto.use;

const normalise = (method: string, p: string): string =>
  `${method.toUpperCase()} ${p
    .replace(/:[A-Za-z0-9_]+/g, '{}')
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\/+/g, '/')
    .replace(/(.)\/$/, '$1')}`;

const collect = (stack: Layer[], prefix: string, out: Set<string>): void => {
  for (const layer of stack) {
    if (layer.route) {
      for (const method of Object.keys(layer.route.methods)) {
        if (method !== '_all') {
          out.add(normalise(method, prefix + layer.route.path));
        }
      }
    } else if (layer.handle.stack) {
      const mount = layer.mountPath === '/' ? '' : (layer.mountPath ?? '');
      collect(layer.handle.stack, prefix + mount, out);
    }
  }
};

describe('OpenAPI spec', () => {
  let mounted: Set<string>;
  let documented: Set<string>;

  beforeAll(async () => {
    routerProto.use = function (this: { stack: Layer[] }, ...args) {
      const before = this.stack.length;
      const result = originalUse.apply(this, args);
      const mountPath = typeof args[0] === 'string' ? args[0] : '/';
      for (const layer of this.stack.slice(before)) {
        layer.mountPath = mountPath;
      }
      return result;
    };

    try {
      const { default: app } = await import('../app');
      mounted = new Set();
      collect(
        (app as unknown as { router: { stack: Layer[] } }).router.stack,
        '',
        mounted,
      );
    } finally {
      routerProto.use = originalUse;
    }

    const spec = parse(fs.readFileSync(SPEC_PATH, 'utf8')) as {
      paths: Record<string, Record<string, unknown>>;
    };
    documented = new Set();
    for (const [p, item] of Object.entries(spec.paths)) {
      for (const method of Object.keys(item)) {
        if (HTTP_METHODS.includes(method)) {
          documented.add(normalise(method, p));
        }
      }
    }
  });

  it('finds the mounted routes', () => {
    expect(mounted.size).toBeGreaterThan(50);
  });

  it('documents every mounted route', () => {
    expect([...mounted].filter((r) => !documented.has(r)).sort()).toEqual([]);
  });

  it('documents no route that is not mounted', () => {
    expect([...documented].filter((r) => !mounted.has(r)).sort()).toEqual([]);
  });
});
