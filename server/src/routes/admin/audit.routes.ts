import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"
import { validateQuery } from "../../middleware/validate"
import { auditLogsQuerySchema, auditExportQuerySchema } from "@shared/admin-audit"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/", validateQuery(auditLogsQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 20, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.get("/export", validateQuery(auditExportQuerySchema), (req, res) => {
  const format = (req.query as any).format || "csv"
  if (format === "csv") {
    res.status(200).contentType("text/csv").send("")
  } else {
    res.status(200).contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").send()
  }
})

export default router
