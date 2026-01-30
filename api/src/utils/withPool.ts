import { Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';

export type HandlerWithPool<Req = Request> = (
  req: Req,
  res: Response,
  pool: Pool
) => void | Response | Promise<void | Response>;

export function withPool<Req = Request>(
  pool: Pool,
  handler: HandlerWithPool<Req>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as Req, res, pool)).catch(next);
  };
}
