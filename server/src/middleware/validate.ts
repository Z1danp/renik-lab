import type { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

function formatZodErrors(error: ZodError): string {
  return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(". ")
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: formatZodErrors(result.error),
      })
      return
    }
    req.body = result.data
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: formatZodErrors(result.error),
      })
      return
    }
    req.query = result.data as any
    next()
  }
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: formatZodErrors(result.error),
      })
      return
    }
    req.params = result.data as any
    next()
  }
}
