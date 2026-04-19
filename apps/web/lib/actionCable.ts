import { createConsumer, type Consumer } from "@rails/actioncable"
import { backendOrigin } from "@/lib/env"

export function createCableConsumer(accessToken: string): Consumer {
  const url = `${backendOrigin}/cable?token=${encodeURIComponent(accessToken)}`
  return createConsumer(url)
}
