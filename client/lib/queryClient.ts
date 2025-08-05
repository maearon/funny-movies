// libs/queryClient.ts

import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

// ⏱ Cache TTL
const CACHE_TTL = 1000 * 60 * 5 // 5 phút

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TTL,
      gcTime: CACHE_TTL * 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})

// 🔒 Tạo persister với localStorage
const localStoragePersister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})

// createSyncStoragePersister({
//   storage: window.sessionStorage
// })

// 💾 Kích hoạt persistent cache
if (typeof window !== 'undefined') {
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: CACHE_TTL * 2, // Cache sẽ bị xóa sau 10 phút
  })
}
