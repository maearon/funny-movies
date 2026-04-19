import { getAccessToken } from "@/lib/token"

export type FetchWithAuthInit = RequestInit & { skipAuth?: boolean }

/**
 * Fetch wrapper that attaches JWT the same way as the Axios client.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: FetchWithAuthInit = {},
): Promise<Response> {
  const { skipAuth, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders ?? {})

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  return fetch(input, {
    ...rest,
    headers,
    credentials: rest.credentials ?? "include",
  })
}
