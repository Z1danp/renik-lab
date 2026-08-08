import { z } from "zod"

// ===== ActivityCategory =====
export const ACTIVITY_CATEGORIES = [
  "PRAKTIKUM",
  "PERSIAPAN_REAGEN",
  "PENELITIAN",
  "PENGUJIAN_SAMPEL",
  "MAINTENANCE_ALAT",
  "LAINNYA",
] as const
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]
export const activityCategorySchema = z.enum(ACTIVITY_CATEGORIES, {
  message: "Kategori kegiatan tidak valid",
})

// ===== ActionType =====
export const ACTION_TYPES = ["USAGE", "RESTOCK", "ADJUSTMENT", "DISPOSAL"] as const
export type ActionType = (typeof ACTION_TYPES)[number]
export const actionTypeSchema = z.enum(ACTION_TYPES, {
  message: "Tipe aksi tidak valid",
})

// ===== InventoryStatus =====
export const INVENTORY_STATUSES = ["ACTIVE", "EXPIRED", "EMPTY", "DISPOSED"] as const
export type InventoryStatus = (typeof INVENTORY_STATUSES)[number]
export const inventoryStatusSchema = z.enum(INVENTORY_STATUSES, {
  message: "Status inventori tidak valid",
})

// ===== UserRole =====
export const USER_ROLES = ["ADMIN", "USER_LAB"] as const
export type UserRole = (typeof USER_ROLES)[number]
export const userRoleSchema = z.enum(USER_ROLES, {
  message: "Role pengguna tidak valid",
})

// ===== RiskLevel =====
export const RISK_LEVELS = ["CRITICAL", "HIGH", "WARNING"] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]
export const riskLevelSchema = z.enum(RISK_LEVELS, {
  message: "Level risiko tidak valid",
})

// ===== SignalWord =====
export const SIGNAL_WORDS = ["DANGER", "WARNING", "NONE"] as const
export type SignalWord = (typeof SIGNAL_WORDS)[number]
export const signalWordSchema = z.enum(SIGNAL_WORDS, {
  message: "Signal word tidak valid",
})

// ===== ExportFormat =====
export const EXPORT_FORMATS = ["csv", "xlsx"] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]
export const exportFormatSchema = z.enum(EXPORT_FORMATS, {
  message: "Format ekspor tidak didukung",
})

// ===== QrFormat =====
export const QR_FORMATS = ["png", "svg", "pdf"] as const
export type QrFormat = (typeof QR_FORMATS)[number]
export const qrFormatSchema = z.enum(QR_FORMATS, {
  message: "Format QR tidak didukung",
})
