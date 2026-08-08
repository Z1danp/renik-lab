import { z } from "zod"
import { inventoryStatusSchema } from "./enums"
import { searchQuerySchema, paginationQuerySchema } from "./common"

// ===== QUERY PARAMS =====
export const adminInventoryQuerySchema = searchQuerySchema
  .merge(paginationQuerySchema)
  .extend({
    material_id: z.string().uuid().optional(),
    location_id: z.string().uuid().optional(),
    status: inventoryStatusSchema.optional(),
  })
export type AdminInventoryQuery = z.infer<typeof adminInventoryQuerySchema>

// ===== LIST — GET /api/v1/admin/inventory =====
export interface InventoryListItem {
  id: string
  qr_code: string
  batch_number: string | null
  material_name: string
  material_id: string
  location: string | null
  location_id: string | null
  current_quantity: number
  initial_quantity: number
  unit: string
  expiration_date: string
  status: string
  created_at: string
}

// ===== PARAMS (shared) =====
export const inventoryParamsSchema = z.object({
  item_id: z.string().uuid("ID item inventori tidak valid"),
})
export type InventoryParams = z.infer<typeof inventoryParamsSchema>

// ===== CREATE — POST /api/v1/admin/inventory =====
export const createInventorySchema = z.object({
  material_id: z.string().uuid("ID material tidak valid"),
  location_id: z.string().uuid("ID lokasi tidak valid"),
  batch_number: z.string().optional(),
  initial_quantity: z.number().positive("Kuantitas awal harus lebih dari 0"),
  unit: z.enum(["mL", "g", "L", "kg"], { message: "Satuan tidak valid" }).optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
})
export type CreateInventoryRequest = z.infer<typeof createInventorySchema>

export interface CreateInventoryResponse {
  id: string
  qr_code: string
  batch_number: string | null
  material_name: string
  location: string
  initial_quantity: number
  current_quantity: number
  unit: string
  expiration_date: string
  status: string
  qr_code_url: string
  created_at: string
}

// ===== OSHA CONFLICT =====
export interface OshaConflictItem {
  conflict_with_material_name: string
  conflict_with_ghs_code: string
  risk_level: string
  hazard_description: string
}

// ===== DETAIL — GET /api/v1/admin/inventory/{item_id} =====
export interface AuditLogSummaryItem {
  id: number
  action_type: string
  activity_category: string
  quantity_changed: number
  quantity_after: number
  user_name_snapshot: string
  timestamp: string
}

export interface InventoryDetailMaterialInfo {
  id: string
  name: string
  chemical_formula: string | null
  cas_number: string | null
  ghs_classifications: { code: string; pictogram_symbol: string | null }[]
}

export interface InventoryDetailLocationInfo {
  id: string
  room_name: string
  cabinet_code: string
  shelf_number: string
}

export interface InventoryDetailResponse {
  id: string
  qr_code: string
  batch_number: string | null
  initial_quantity: number
  current_quantity: number
  unit: string
  expiration_date: string
  status: string
  material: InventoryDetailMaterialInfo
  location: InventoryDetailLocationInfo | null
  osha_conflicts_at_location: OshaConflictItem[]
  audit_logs: AuditLogSummaryItem[]
  created_at: string
}

// ===== UPDATE — PUT /api/v1/admin/inventory/{item_id} =====
export const updateInventorySchema = z.object({
  location_id: z.string().uuid().optional(),
  batch_number: z.string().optional(),
  current_quantity: z.number().min(0).optional(),
  expiration_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)")
    .optional(),
  status: inventoryStatusSchema.optional(),
})
export type UpdateInventoryRequest = z.infer<typeof updateInventorySchema>

export interface UpdateInventoryResponse {
  id: string
  qr_code: string
  current_quantity: number
  status: string
  location: string | null
  audit_log_id: number
  updated_at: string
}
