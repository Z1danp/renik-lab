import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { requireUserLab, requireNoForcePin } from "../middleware/role-guard"
import { validateQuery, validateParams, validateBody } from "../middleware/validate"
import { materialsQuerySchema, qrCodeParamsSchema, usageBodySchema } from "@shared/materials"

const router = Router()

router.get("/", requireAuth, requireUserLab, requireNoForcePin, validateQuery(materialsQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 10, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.get("/scan/:qr_code", requireAuth, requireUserLab, requireNoForcePin, validateParams(qrCodeParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      item_info: { qr_code: "", batch_number: null, current_quantity: 0, initial_quantity: 0, unit: "", status: "ACTIVE", expiration_date: "", is_expired: false, is_near_expiry: false },
      material_info: { id: "", name: "", chemical_formula: null, cas_number: null, ghs_classifications: [] },
      location_info: null,
      safety_alerts: { osha_warnings: [] },
    },
  })
})

router.post("/:qr_code/usage", requireAuth, requireUserLab, requireNoForcePin, validateParams(qrCodeParamsSchema), validateBody(usageBodySchema), (_req, res) => {
  res.status(201).json({
    status: "success",
    message: "Pemakaian bahan berhasil dicatat.",
    data: {
      audit_log_id: "0",
      material_name: "",
      qr_code: "",
      quantity_used: 0,
      quantity_remaining: 0,
      unit: "",
      activity_category: "PRAKTIKUM",
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
