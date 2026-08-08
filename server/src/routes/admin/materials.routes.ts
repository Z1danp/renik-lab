import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"
import { validateQuery, validateParams, validateBody } from "../../middleware/validate"
import {
  adminMaterialsQuerySchema,
  createMaterialSchema,
  materialParamsSchema,
  updateMaterialSchema,
} from "@shared/admin-materials"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/", validateQuery(adminMaterialsQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 20, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.post("/", validateBody(createMaterialSchema), (_req, res) => {
  res.status(201).json({
    status: "success",
    message: "Bahan baru berhasil ditambahkan.",
    data: {
      id: "", name: "", chemical_formula: null, cas_number: null,
      unit: "mL", min_stock_alert: 0, total_available_stock: 0,
      ghs_classifications: [], created_at: new Date().toISOString(),
    },
  })
})

router.get("/:id", validateParams(materialParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      id: "", name: "", chemical_formula: null, cas_number: null,
      unit: "mL", min_stock_alert: 0, total_available_stock: 0,
      ghs_classifications: [], inventory_items: [],
      created_at: "", updated_at: "",
    },
  })
})

router.put("/:id", validateParams(materialParamsSchema), validateBody(updateMaterialSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Data bahan berhasil diperbarui.",
    data: {
      id: "", name: "", chemical_formula: null, cas_number: null,
      unit: "mL", min_stock_alert: 0, total_available_stock: 0,
      ghs_classifications: [], updated_at: new Date().toISOString(),
    },
  })
})

router.delete("/:id", validateParams(materialParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Bahan berhasil dihapus.",
  })
})

export default router
