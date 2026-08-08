// ===== GET /api/v1/admin/dashboard/alerts =====

export interface DashboardSummary {
  total_materials: number
  total_active_items: number
  total_users_lab: number
  low_stock_count: number
  near_expiry_count: number
  expired_count: number
}

export interface LowStockItem {
  material_id: string
  material_name: string
  total_available_stock: number
  min_stock_alert: number
  unit: string
  shortfall: number
}

export interface NearExpiryItem {
  item_id: string
  qr_code: string
  material_name: string
  current_quantity: number
  unit: string
  expiration_date: string
  days_until_expiry: number
  location: string
}

export interface ExpiredItem {
  item_id: string
  qr_code: string
  material_name: string
  current_quantity: number
  unit: string
  expiration_date: string
  days_since_expiry: number
  location: string
  status: string
}

export interface DashboardAlertsResponse {
  summary: DashboardSummary
  low_stock: LowStockItem[]
  near_expiry: NearExpiryItem[]
  expired: ExpiredItem[]
}
