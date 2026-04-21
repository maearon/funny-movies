// components/shared/handleNetworkError.ts

export function handleNetworkError(error: any): void {
  if (error.name === "TypeError" && error.message === "Failed to fetch") {
    error.code = "ERR_NETWORK"
  }

  // You can add alert/toast here if you want
  // flashMessage("error", "Lost connection to the server.")
  throw error
}
