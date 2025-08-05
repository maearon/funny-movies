// apps/web/api/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { fetchUser } from "@/store/sessionSlice"
import type { AppDispatch } from "@/store/store"
import { getAccessToken } from "@/lib/token"

export const useCurrentUser = () => {
  const dispatch = useDispatch<AppDispatch>()

  const token = typeof window !== "undefined" ? getAccessToken() : null

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = await dispatch(fetchUser()).unwrap()
      return user
    },
    enabled: !!token, // ✅ Chỉ chạy khi đã có token
    staleTime: 1000 * 60 * 5,
    retry: false, // ⛔ Đây chính là chặn retry nếu fetchUser bị lỗi (401, 403, etc.) infinite loops loading F5 avoided
    refetchOnWindowFocus: false,
  })
}
