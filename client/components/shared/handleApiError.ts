import type { ErrorMessageType } from "@/components/shared/errorMessages"

export function handleApiError(error: any): ErrorMessageType {
  const res = error?.data || error?.response?.data || {}
  const status = error?._status || res?._status || error?.response?.status || 500

  const fieldErrors: ErrorMessageType = {}

  // ✅ Lỗi 422: validation
  if (status === 422 && Array.isArray(res?.errors)) {
    res.errors.forEach((err: any) => {
      const field = err?.cause?.field || "general"
      const message = err?.defaultMessage || "Invalid input"
      if (!fieldErrors[field]) fieldErrors[field] = []
      fieldErrors[field].push(message)
    })
    return fieldErrors
  }

  // 🔐 401/403
  if (status === 401) return { general: ["Unauthorized. Please login again."] }
  if (status === 403) return { general: ["You do not have permission to perform this action."] }

  // 💥 500 - Server error
  if (status === 500) return { general: ["Server error. Please try again later."] }

  // 🚫 503 - Service unavailable / timeout
  if (status === 503) {
    return { general: ["Cannot connect to the server. Please try again later."] }
  }

  // 📩 Server trả về message rõ ràng
  if (res?.message) return { general: [res.message] }

  // ❌ Không có response: lỗi mạng
  if (!error?.response) {
    return { general: ["Cannot connect to the server. Please try again later."] }
  }

  // ❓ Fallback
  return { general: ["Something went wrong. Please try again."] }
}
