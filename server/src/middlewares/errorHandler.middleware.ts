import type { NextFunction, Request, Response } from 'express'

export const errorHandlerMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err)
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  res.status(500).json({ message })
}
