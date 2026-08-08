import { z } from "zod"
import { activityCategorySchema } from "./enums"
import { searchQuerySchema, paginationQuerySchema } from "./common"

// ===== GET /api/v1/materials — Katalog =====
export const materialsQuerySchema = searchQuerySchema.merge(paginationQuerySchema)
export type MaterialsQuery = z.infer<typeof materialsQuerySchema>

export interface MaterialCatalogItem {
  id: string
  name: string
  chemical_formula: string | null
  total_available_stock: number
  unit: string
  locations: string[]
  ghs_pictograms: string[]
}

// ===== GET /api/v1/inventory/scan/{qr_code} =====
export const qrCodeParamsSchema = z.object({
  qr_code: z.string().min(1, "QR Code tidak boleh kosong"),
})
export type QrCodeParams = z.infer<typeof qrCodeParamsSchema>

export interface GHSClassificationItem {
  id: number
  code: string
  category_name: string
  pictogram_symbol: string | null
  signal_word: string
}

export interface OshaWarning {
  triggered_by_ghs_code: string
  incompatible_with_ghs_code: string
  risk_level: string
  hazard_description: string
}

export interface ScanQrResponse {
  item_info: {
    qr_code: string
    batch_number: string | null
    current_quantity: number
    initial_quantity: number
    unit: string
    status: string
    expiration_date: string
    is_expired: boolean
    is_near_expiry: boolean
  }
  material_info: {
    id: string
    name: string
    chemical_formula: string | null
    cas_number: string | null
    ghs_classifications: GHSClassificationItem[]
  }
  location_info: {
    room_name: string
    cabinet_code: string
    shelf_number: string
  } | null
  safety_alerts: {
    osha_warnings: OshaWarning[]
  }
}

// ===== POST /api/v1/inventory/{qr_code}/usage =====
export const usageBodySchema = z.object({
  quantity_used: z.number().positive("Kuantitas harus lebih dari 0"),
  activity_category: activityCategorySchema,
  notes: z.string().optional(),
})
export type UsageRequest = z.infer<typeof usageBodySchema>

export interface UsageResponse {
  audit_log_id: string
  material_name: string
  qr_code: string
  quantity_used: number
  quantity_remaining: number
  unit: string
  activity_category: string
  timestamp: string
}
