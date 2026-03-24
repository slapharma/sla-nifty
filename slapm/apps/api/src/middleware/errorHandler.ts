import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
