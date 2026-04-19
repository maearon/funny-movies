class NotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "video_notifications"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
