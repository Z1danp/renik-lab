import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import type { UserRole } from "@shared/enums"

export interface AuthPayload {
  sub: string
  name: string
  nip?: string
  email?: string
  role: UserRole
  must_change_pin: boolean
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    })
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    })
  }
}
