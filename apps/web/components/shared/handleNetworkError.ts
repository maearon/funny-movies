// components/shared/handleNetworkError.ts

export function handleNetworkError(error: any): void {
  if (error.name === "TypeError" && error.message === "Failed to fetch") {
    error.code = "ERR_NETWORK"
  }

  // Có thể thêm alert/toast ở đây nếu muốn
  // flashMessage("error", "Lost connection to the server.")
  throw error
}
