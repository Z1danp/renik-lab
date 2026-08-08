import { z } from "zod"
import { userRoleSchema } from "./enums"
import { searchQuerySchema, paginationQuerySchema } from "./common"

// ===== LIST — GET /api/v1/admin/users =====
export const adminUsersQuerySchema = searchQuerySchema.merge(paginationQuerySchema).extend({
  role: userRoleSchema.optional(),
})
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>

export interface UserListItem {
  id: string
  name: string
  nip: string | null
  email: string | null
  role: string
  must_change_pin: boolean
  created_at: string
}

// ===== PARAMS (shared) =====
export const userParamsSchema = z.object({
  id: z.string().uuid("ID pengguna tidak valid"),
})
export type UserParams = z.infer<typeof userParamsSchema>

// ===== CREATE — POST /api/v1/admin/users =====
export const createUserSchema = z.discriminatedUnion("role", [
  z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    nip: z.string().min(1, "NIP wajib diisi"),
    pin: z.string().length(4, "PIN harus 4 digit").regex(/^\d{4}$/, "PIN harus 4 digit angka"),
    role: z.literal("USER_LAB"),
  }),
  z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.literal("ADMIN"),
  }),
])
export type CreateUserRequest = z.infer<typeof createUserSchema>

export interface CreateUserResponse {
  id: string
  name: string
  nip?: string
  email?: string
  role: string
  must_change_pin: boolean
  created_at: string
}

// ===== DETAIL — GET /api/v1/admin/users/{id} =====
export interface UserDetailResponse {
  id: string
  name: string
  nip: string | null
  email: string | null
  role: string
  must_change_pin: boolean
  total_usage_count: number
  last_activity: string | null
  created_at: string
}

// ===== UPDATE — PUT /api/v1/admin/users/{id} =====
export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  nip: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional(),
  pin: z
    .string()
    .length(4, "PIN harus 4 digit")
    .regex(/^\d{4}$/, "PIN harus 4 digit angka")
    .optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  role: userRoleSchema.optional(),
})
export type UpdateUserRequest = z.infer<typeof updateUserSchema>

export interface UpdateUserResponse {
  id: string
  name: string
  nip?: string | null
  email?: string | null
  role: string
  must_change_pin: boolean
}
