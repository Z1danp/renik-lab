import { z } from "zod"

export interface ApiSuccess<T> {
  status: "success"
  message?: string
  data: T
  meta?: PaginationMeta
}

export interface ApiError {
  status: "error"
  code: string
  message: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginationMeta {
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export interface Paginated<T> {
  meta: PaginationMeta
  data: T[]
}

export const searchQuerySchema = z.object({
  search: z.string().optional(),
})

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const listQuerySchema = searchQuerySchema.merge(paginationQuerySchema)

export type SearchQuery = z.infer<typeof searchQuerySchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type ListQuery = z.infer<typeof listQuerySchema>
