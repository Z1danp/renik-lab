import { z } from "zod"
import { listQuerySchema } from "./common"

// ===== LIST — GET /api/v1/admin/materials =====
export const adminMaterialsQuerySchema = listQuerySchema
export type AdminMaterialsQuery = z.infer<typeof adminMaterialsQuerySchema>

export interface MaterialListGhsItem {
  id: number
  code: string
  category_name: string
  pictogram_symbol: string | null
}

export interface MaterialListItem {
  id: string
  name: string
  chemical_formula: string | null
  cas_number: string | null
  unit: string
  min_stock_alert: number
  total_available_stock: number
  ghs_classifications: MaterialListGhsItem[]
  active_item_count: number
  created_at: string
  updated_at: string
}

// ===== CREATE — POST /api/v1/admin/materials =====
export const createMaterialSchema = z.object({
  name: z.string().min(1, "Nama bahan wajib diisi"),
  chemical_formula: z.string().optional(),
  cas_number: z.string().optional(),
  unit: z.enum(["mL", "g", "L", "kg"], { message: "Satuan tidak valid" }),
  min_stock_alert: z.number().min(0).default(0),
  ghs_classification_ids: z.array(z.number().int().positive()).default([]),
})
export type CreateMaterialRequest = z.infer<typeof createMaterialSchema>

export interface CreateMaterialResponse {
  id: string
  name: string
  chemical_formula: string | null
  cas_number: string | null
  unit: string
  min_stock_alert: number
  total_available_stock: number
  ghs_classifications: { id: number; code: string; pictogram_symbol: string | null }[]
  created_at: string
}

// ===== DETAIL — GET /api/v1/admin/materials/{id} =====
export const materialParamsSchema = z.object({
  id: z.string().uuid("ID material tidak valid"),
})
export type MaterialParams = z.infer<typeof materialParamsSchema>

export interface GHSClassificationFullItem {
  id: number
  code: string
  category_name: string
  pictogram_symbol: string | null
  signal_word: string
}

export interface InventorySummary {
  id: string
  qr_code: string
  batch_number: string | null
  current_quantity: number
  initial_quantity: number
  status: string
  expiration_date: string
  location: string
}

export interface MaterialDetailResponse {
  id: string
  name: string
  chemical_formula: string | null
  cas_number: string | null
  unit: string
  min_stock_alert: number
  total_available_stock: number
  ghs_classifications: GHSClassificationFullItem[]
  inventory_items: InventorySummary[]
  created_at: string
  updated_at: string
}

// ===== UPDATE — PUT /api/v1/admin/materials/{id} =====
export const updateMaterialSchema = z.object({
  name: z.string().min(1).optional(),
  chemical_formula: z.string().optional().nullable(),
  cas_number: z.string().optional().nullable(),
  unit: z.enum(["mL", "g", "L", "kg"], { message: "Satuan tidak valid" }).optional(),
  min_stock_alert: z.number().min(0).optional(),
  ghs_classification_ids: z.array(z.number().int().positive()).optional(),
})
export type UpdateMaterialRequest = z.infer<typeof updateMaterialSchema>

export interface UpdateMaterialResponse {
  id: string
  name: string
  chemical_formula: string | null
  cas_number: string | null
  unit: string
  min_stock_alert: number
  total_available_stock: number
  ghs_classifications: { id: number; code: string }[]
  updated_at: string
}
