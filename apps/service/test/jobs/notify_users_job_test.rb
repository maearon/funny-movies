# require "test_helper"

# class NotifyUsersJobTest < ActiveJob::TestCase
#   include ActionCable::TestHelper

#   test "broadcasts when micropost exists" do
#     micropost = microposts(:one)

#     assert_broadcasts("video_notifications", 1) do
#       NotifyUsersJob.perform_now(micropost.id)
#     end
#   end
# end

require "test_helper"

class NotifyUsersJobTest < ActiveJob::TestCase
  include ActionCable::TestHelper

  def setup
    @user = users(:one)
    @micropost = Micropost.create!(
      user: @user,
      content: "https://youtube.com/test",
      title: "Test Video",
      youtube_id: "test123"
    )
  end

  test "broadcasts video notification" do
    assert_broadcast_on("video_notifications", {
      type: "VIDEO_SHARED",
      micropost_id: @micropost.id,
      video_title: @micropost.title,
      sharer_name: @user.name,
      sharer_id: @user.id,
      youtube_id: @micropost.youtube_id
    }) do
      NotifyUsersJob.perform_now(@micropost.id)
    end
  end

  test "enqueues and broadcasts" do
    assert_enqueued_with(job: NotifyUsersJob) do
      NotifyUsersJob.perform_later(@micropost.id)
    end

    perform_enqueued_jobs

    assert_broadcasts("video_notifications", 1)
  end
end
