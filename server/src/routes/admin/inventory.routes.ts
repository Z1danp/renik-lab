import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"
import { validateQuery, validateParams, validateBody } from "../../middleware/validate"
import {
  adminInventoryQuerySchema,
  createInventorySchema,
  inventoryParamsSchema,
  updateInventorySchema,
} from "@shared/admin-inventory"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/", validateQuery(adminInventoryQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 20, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.post("/", validateBody(createInventorySchema), (_req, res) => {
  res.status(201).json({
    status: "success",
    message: "Botol baru berhasil didaftarkan dan QR Code telah dibuat.",
    data: {
      id: "", qr_code: "", batch_number: null, material_name: "",
      location: "", initial_quantity: 0, current_quantity: 0,
      unit: "mL", expiration_date: "", status: "ACTIVE",
      qr_code_url: "", created_at: new Date().toISOString(),
    },
  })
})

router.get("/qr/:item_id", validateParams(inventoryParamsSchema), (_req, res) => {
  res.status(200).contentType("image/png").send()
})

router.get("/:item_id", validateParams(inventoryParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: "", qr_code: "", batch_number: null, initial_quantity: 0,
      current_quantity: 0, unit: "mL", expiration_date: "", status: "ACTIVE",
      material: { id: "", name: "", chemical_formula: null, cas_number: null, ghs_classifications: [] },
      location: null, osha_conflicts_at_location: [], audit_logs: [],
      created_at: "",
    },
  })
})

router.put("/:item_id", validateParams(inventoryParamsSchema), validateBody(updateInventorySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Item inventori berhasil diperbarui.",
    data: {
      id: "", qr_code: "", current_quantity: 0, status: "ACTIVE",
      location: null, audit_log_id: 0, updated_at: new Date().toISOString(),
    },
  })
})

router.delete("/:item_id", validateParams(inventoryParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Item inventori berhasil dihapus.",
  })
})

export default router
