import { Nullable } from "@/types/common"

// 📦 apps/web/lib/token.ts
export const setTokens = (access: string, refresh: string, keepLoggedIn: boolean) => {
  if (typeof window !== "undefined") {
    const storage = keepLoggedIn ? localStorage : sessionStorage
    storage.setItem("token", access)
    storage.setItem("refresh_token", refresh)
  }
}

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("refresh_token")
  }
}

export const getAccessToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }
  return null
}

export const getRefreshToken = (): Nullable<string> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token")
  }
  return null
}
