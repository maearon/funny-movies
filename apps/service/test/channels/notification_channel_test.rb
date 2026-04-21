require "test_helper"

class NotificationChannelTest < ActionCable::Channel::TestCase
  def setup
    @user = users(:one)
    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  test "subscribes successfully with valid token" do
    stub_connection current_user: @user

    subscribe

    assert subscription.confirmed?
    assert_has_stream "video_notifications"
  end

  # test "rejects subscription without current_user" do
  #   stub_connection current_user: nil

  #   subscribe

  #   assert subscription.rejected?
  # end
end