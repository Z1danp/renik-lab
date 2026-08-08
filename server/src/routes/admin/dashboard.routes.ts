import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/alerts", (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      summary: {
        total_materials: 0, total_active_items: 0, total_users_lab: 0,
        low_stock_count: 0, near_expiry_count: 0, expired_count: 0,
      },
      low_stock: [],
      near_expiry: [],
      expired: [],
    },
  })
})

export default router
