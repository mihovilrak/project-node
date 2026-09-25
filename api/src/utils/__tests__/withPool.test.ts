import { Request, Response } from 'express';
import { Pool } from 'pg';
import { withPool } from '../withPool';

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('withPool', () => {
  const pool = {} as Pool;
  const req = {} as Request;
  const res = {} as Response;

  it('passes the pool to the handler', async () => {
    const handler = jest.fn();
    const next = jest.fn();

    withPool(pool, handler)(req, res, next);
    await flush();

    expect(handler).toHaveBeenCalledWith(req, res, pool);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards async errors to next', async () => {
    const error = new Error('boom');
    const next = jest.fn();

    withPool(pool, async () => {
      throw error;
    })(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledWith(error);
  });
});
