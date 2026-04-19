class NotifyUsersJob < ApplicationJob
  queue_as :default

  def perform(micropost_id)
    micropost = Micropost.includes(:user).find_by(id: micropost_id)
    return if micropost.blank? || micropost.user.blank?

    ActionCable.server.broadcast(
      "video_notifications",
      {
        type: "VIDEO_SHARED",
        micropost_id: micropost.id,
        video_title: micropost.title,
        sharer_name: micropost.user.name,
        sharer_id: micropost.user_id,
        youtube_id: micropost.youtube_id
      }
    )
  end
end
