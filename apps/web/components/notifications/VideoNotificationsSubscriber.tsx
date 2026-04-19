"use client"

import { useEffect } from "react"
import { useAppSelector } from "@/redux/hooks"
import { selectUser } from "@/redux/session/sessionSlice"
import { getAccessToken } from "@/lib/token"
import { createCableConsumer } from "@/lib/actionCable"
import flashMessage from "@/components/shared/flashMessages"

export default function VideoNotificationsSubscriber() {
  const { value: user } = useAppSelector(selectUser)

  useEffect(() => {
    if (!user?.email) return
    const token = getAccessToken()
    if (!token) return

    const consumer = createCableConsumer(token)
    const sub = consumer.subscriptions.create(
      { channel: "NotificationChannel" },
      {
        received(data: {
          type?: string
          video_title?: string
          sharer_name?: string
          sharer_id?: number | string
        }) {
          if (data.type !== "VIDEO_SHARED") return
          if (String(data.sharer_id) === String(user.id)) return
          flashMessage(
            "info",
            `${data.sharer_name ?? "Someone"} shared a video: ${data.video_title ?? "Untitled"}`,
          )
        },
      },
    )

    return () => {
      sub.unsubscribe()
      consumer.disconnect()
    }
  }, [user?.email, user?.id])

  return null
}
