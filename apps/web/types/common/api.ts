// types/common/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
  status: number
}
