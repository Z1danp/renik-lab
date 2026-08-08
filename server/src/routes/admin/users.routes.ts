import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"
import { validateQuery, validateParams, validateBody } from "../../middleware/validate"
import {
  adminUsersQuerySchema,
  createUserSchema,
  userParamsSchema,
  updateUserSchema,
} from "@shared/admin-users"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/", validateQuery(adminUsersQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 20, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.post("/", validateBody(createUserSchema), (_req, res) => {
  res.status(201).json({
    status: "success",
    message: "Pengguna baru berhasil didaftarkan.",
    data: {
      id: "", name: "", role: "USER_LAB", must_change_pin: true,
      created_at: new Date().toISOString(),
    },
  })
})

router.get("/:id", validateParams(userParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: "", name: "", nip: null, email: null, role: "USER_LAB",
      must_change_pin: false, total_usage_count: 0,
      last_activity: null, created_at: "",
    },
  })
})

router.put("/:id", validateParams(userParamsSchema), validateBody(updateUserSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Data pengguna berhasil diperbarui.",
    data: {
      id: "", name: "", role: "USER_LAB", must_change_pin: false,
    },
  })
})

router.delete("/:id", validateParams(userParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Pengguna berhasil dihapus.",
  })
})

export default router
