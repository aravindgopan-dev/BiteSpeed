import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message,
  });
};

export default errorHandler;
