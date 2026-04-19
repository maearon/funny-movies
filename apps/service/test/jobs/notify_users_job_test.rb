require "test_helper"

class NotifyUsersJobTest < ActiveJob::TestCase
  include ActionCable::TestHelper

  test "broadcasts when micropost exists" do
    micropost = microposts(:one)

    assert_broadcasts("video_notifications", 1) do
      NotifyUsersJob.perform_now(micropost.id)
    end
  end
end
