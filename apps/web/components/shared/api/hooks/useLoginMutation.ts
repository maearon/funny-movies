import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/redux/store"
import { setTokens } from "@/lib/token"
import { handleNetworkError } from "@/components/shared/handleNetworkError"
// apps/web/api/hooks/useLogout.ts
import { useCallback } from "react"
import { clearTokens } from "@/lib/token"
// ------------------------
// apps/web/api/hooks/useInitSession.ts
import { useCurrentUser } from "./useCurrentUser"
import { fetchUser, logout } from "@/redux/session/sessionSlice"
import sessionApi from "../sessionApi"
import flashMessage from "../../flashMessages"

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(async () => {
    try {
      await sessionApi.destroy()
      dispatch(logout())
      clearTokens()
      await dispatch(fetchUser()) // ✅ Redux fetch user sau logout
    } catch (error) {
      console.error("Logout failed", error)
    }
  }, [dispatch])
}


interface LoginPayload {
  email: string
  password: string
  keepLoggedIn?: boolean
}

export const useLoginMutation = () => {
  const dispatch = useDispatch<AppDispatch>()

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ email, password, keepLoggedIn = true }: LoginPayload) => {
      try {
        const response = await sessionApi.create({
          session: { email, password },
        })

        // ✅ Kiểm tra an toàn trước khi sử dụng
        if (!response?.tokens?.access?.token || !response?.tokens?.refresh?.token) {
          throw new Error("Invalid login response: missing tokens.")
        }

        const { access, refresh } = response.tokens
        setTokens(access.token, refresh.token, keepLoggedIn)

        return response
      } catch (error: any) {
        handleNetworkError(error)
        throw error
      }
    },
    onSuccess: async () => {
      try {
        await dispatch(fetchUser())
        flashMessage('success', 'Logged in successfully!')
      } catch (err) {
        flashMessage('error', 'But failed to fetch user profile.')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error
      flashMessage('error', message ? `Error: ${message}` : "Login failed. Please try again.")
    },
  })
}
