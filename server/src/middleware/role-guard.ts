import type { Request, Response, NextFunction } from "express"

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({
      status: "error",
      code: "FORBIDDEN",
      message: "Anda tidak memiliki akses ke resource ini.",
    })
    return
  }
  next()
}

export function requireUserLab(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "USER_LAB") {
    res.status(403).json({
      status: "error",
      code: "FORBIDDEN",
      message: "Endpoint ini hanya untuk pengguna lab.",
    })
    return
  }
  next()
}

export function requireNoForcePin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.must_change_pin) {
    res.status(403).json({
      status: "error",
      code: "FORCE_CHANGE_PIN",
      message: "Anda diwajibkan mengganti PIN sebelum melakukan transaksi.",
    })
    return
  }
  next()
}
