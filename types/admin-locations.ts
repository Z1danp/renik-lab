import { z } from "zod"
import { listQuerySchema } from "./common"
import type { GHSClassificationFullItem } from "./admin-materials"

// ===== GHS REFERENCE — GET /api/v1/admin/ghs-classifications =====
export type GhsListItem = GHSClassificationFullItem

// ===== LIST LOCATIONS — GET /api/v1/admin/storage-locations =====
export const storageLocationsQuerySchema = listQuerySchema
export type StorageLocationsQuery = z.infer<typeof storageLocationsQuerySchema>

export interface StorageLocationItem {
  id: string
  room_name: string
  cabinet_code: string
  shelf_number: string
  description: string | null
  active_items_count: number
  created_at: string
}

// ===== PARAMS (shared) =====
export const locationParamsSchema = z.object({
  id: z.string().uuid("ID lokasi tidak valid"),
})
export type LocationParams = z.infer<typeof locationParamsSchema>

// ===== CREATE — POST /api/v1/admin/storage-locations =====
export const createStorageLocationSchema = z.object({
  room_name: z.string().min(1, "Nama ruangan wajib diisi"),
  cabinet_code: z.string().min(1, "Kode lemari wajib diisi"),
  shelf_number: z.string().min(1, "Nomor rak wajib diisi"),
  description: z.string().optional(),
})
export type CreateStorageLocationRequest = z.infer<typeof createStorageLocationSchema>

export interface CreateStorageLocationResponse {
  id: string
  room_name: string
  cabinet_code: string
  shelf_number: string
  description: string | null
  active_items_count: number
  created_at: string
}

// ===== UPDATE — PUT /api/v1/admin/storage-locations/{id} =====
export const updateStorageLocationSchema = z.object({
  room_name: z.string().min(1).optional(),
  cabinet_code: z.string().min(1).optional(),
  shelf_number: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
})
export type UpdateStorageLocationRequest = z.infer<typeof updateStorageLocationSchema>

export interface UpdateStorageLocationResponse {
  id: string
  room_name: string
  cabinet_code: string
  shelf_number: string
  description: string | null
  active_items_count: number
}
