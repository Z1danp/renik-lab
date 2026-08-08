import { Router } from "express"
import { requireAuth } from "../../middleware/auth"
import { requireAdmin } from "../../middleware/role-guard"
import { validateQuery, validateParams, validateBody } from "../../middleware/validate"
import {
  storageLocationsQuerySchema,
  createStorageLocationSchema,
  locationParamsSchema,
  updateStorageLocationSchema,
} from "@shared/admin-locations"

const router = Router()
router.use(requireAuth, requireAdmin)

router.get("/classifications", (_req, res) => {
  res.status(200).json({
    status: "success",
    data: [],
  })
})

router.get("/locations", validateQuery(storageLocationsQuerySchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    meta: { page: 1, limit: 20, total_items: 0, total_pages: 0 },
    data: [],
  })
})

router.post("/locations", validateBody(createStorageLocationSchema), (_req, res) => {
  res.status(201).json({
    status: "success",
    message: "Lokasi penyimpanan baru berhasil ditambahkan.",
    data: {
      id: "", room_name: "", cabinet_code: "", shelf_number: "",
      description: null, active_items_count: 0, created_at: new Date().toISOString(),
    },
  })
})

router.put("/locations/:id", validateParams(locationParamsSchema), validateBody(updateStorageLocationSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Lokasi penyimpanan berhasil diperbarui.",
    data: {
      id: "", room_name: "", cabinet_code: "", shelf_number: "",
      description: null, active_items_count: 0,
    },
  })
})

router.delete("/locations/:id", validateParams(locationParamsSchema), (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Lokasi penyimpanan berhasil dihapus.",
  })
})

export default router
