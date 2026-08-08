import { z } from "zod"
import type { UserRole } from "./enums"

// ===== POST /api/v1/auth/login/user =====
export const loginUserSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  pin: z.string().length(4, "PIN harus 4 digit"),
})
export type LoginUserRequest = z.infer<typeof loginUserSchema>

export interface LoginUserResponse {
  user: {
    id: string
    name: string
    nip: string
    role: "USER_LAB"
  }
  must_change_pin: boolean
}

// ===== POST /api/v1/auth/login/admin =====
export const loginAdminSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})
export type LoginAdminRequest = z.infer<typeof loginAdminSchema>

export interface LoginAdminResponse {
  user: {
    id: string
    name: string
    email: string
    role: "ADMIN"
  }
}

// ===== GET /api/v1/auth/me =====
export interface MeResponse {
  id: string
  name: string
  nip?: string
  email?: string
  role: UserRole
  must_change_pin: boolean
}

// ===== PUT /api/v1/auth/change-pin =====
export const changePinSchema = z
  .object({
    old_pin: z.string().length(4, "PIN lama harus 4 digit"),
    new_pin: z
      .string()
      .length(4, "PIN baru harus 4 digit")
      .regex(/^\d{4}$/, "PIN harus berupa 4 digit angka"),
    confirm_pin: z.string().length(4, "Konfirmasi PIN harus 4 digit"),
  })
  .refine((data) => data.new_pin === data.confirm_pin, {
    message: "Konfirmasi PIN tidak cocok",
    path: ["confirm_pin"],
  })
  .refine((data) => data.old_pin !== data.new_pin, {
    message: "PIN baru tidak boleh sama dengan PIN lama",
    path: ["new_pin"],
  })
export type ChangePinRequest = z.infer<typeof changePinSchema>

export interface ChangePinResponse {
  must_change_pin: false
}
