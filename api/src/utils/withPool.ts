import { Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';

export type HandlerWithPool<Req = Request> = (
  req: Req,
  res: Response,
  pool: Pool,
) => void | Response | Promise<void | Response>;

/**
 * Create a request handler that injects a database pool into the handler function and catches promise rejections.
 * @param pool The database pool instance to inject into the handler.
 * @param handler The async-capable handler function that receives the pool as its third argument.
 */
export function withPool<Req = Request>(
  pool: Pool,
  handler: HandlerWithPool<Req>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as Req, res, pool)).catch(next);
  };
}
