require "test_helper"

class ConnectionTest < ActionCable::Connection::TestCase
  tests ApplicationCable::Connection

  def setup
    @user = users(:one)
    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  test "connects with valid token" do
    connect params: { token: @token }

    assert_equal @user, connection.current_user
  end

  test "rejects connection without token" do
    assert_reject_connection do
      connect params: {}
    end
  end

  # test "rejects connection with invalid token" do
  #   assert_reject_connection do
  #     connect params: { token: "invalid" }
  #   end
  # end
end