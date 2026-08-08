import { z } from "zod"
import { activityCategorySchema, actionTypeSchema, exportFormatSchema } from "./enums"
import { paginationQuerySchema } from "./common"

// ===== LIST — GET /api/v1/admin/audit-logs =====
export const auditLogsQuerySchema = paginationQuerySchema.extend({
  user_name: z.string().optional(),
  material_name: z.string().optional(),
  activity_category: activityCategorySchema.optional(),
  action_type: actionTypeSchema.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)").optional(),
})
export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>

export interface AuditLogItem {
  id: number
  inventory_item_id: string | null
  qr_code: string | null
  action_type: string
  activity_category: string
  quantity_changed: number
  quantity_before: number
  quantity_after: number
  unit: string
  material_name_snapshot: string
  user_name_snapshot: string
  notes: string | null
  timestamp: string
}

// ===== EXPORT — GET /api/v1/admin/audit-logs/export =====
export const auditExportQuerySchema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)").optional(),
  format: exportFormatSchema.default("csv"),
  activity_category: activityCategorySchema.optional(),
  action_type: actionTypeSchema.optional(),
  user_name: z.string().optional(),
})
export type AuditExportQuery = z.infer<typeof auditExportQuerySchema>
