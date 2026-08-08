import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { requireUserLab } from "../middleware/role-guard"
import { validateBody } from "../middleware/validate"
import { loginUserSchema, loginAdminSchema, changePinSchema } from "@shared/auth"

const router = Router()

router.post("/login/user", validateBody(loginUserSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Login berhasil.",
    data: {
      user: { id: "", name: "", nip: "", role: "USER_LAB" },
      must_change_pin: false,
    },
  })
})

router.post("/login/admin", validateBody(loginAdminSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Login admin berhasil.",
    data: {
      user: { id: "", name: "", email: "", role: "ADMIN" },
    },
  })
})

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: req.user?.sub,
      name: req.user?.name,
      nip: req.user?.nip,
      email: req.user?.email,
      role: req.user?.role,
      must_change_pin: req.user?.must_change_pin,
    },
  })
})

router.put("/change-pin", requireAuth, requireUserLab, validateBody(changePinSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "PIN berhasil diubah.",
    data: { must_change_pin: false },
  })
})

router.post("/logout", requireAuth, (_req, res) => {
  res.clearCookie("token")
  res.status(200).json({
    status: "success",
    message: "Logout berhasil. Sesi Anda telah dihapus.",
  })
})

export default router
