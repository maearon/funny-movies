require "test_helper"

class UserFlowTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  def setup
    @user = users(:one)
    @user.update(
      password: "password",
      password_confirmation: "password",
      activated: true
    )
  end

  test "user login and create micropost flow" do
    # =========================
    # 1. LOGIN
    # =========================
    post api_login_url,
         params: {
           session: {
             email: @user.email,
             password: "password"
           }
         },
         as: :json

    assert_response :success

    @user.reload
    assert_not_nil @user.refresh_token

    # generate access token (same as FE will do after login)
    token = Jwt::User::EncodeTokenService.call(@user.id).first

    # =========================
    # 2. CREATE MICROPOST
    # =========================
    assert_enqueued_jobs 1, only: NotifyUsersJob do
      post api_microposts_url,
           params: {
             micropost: {
               content: "https://www.youtube.com/watch?v=abc123",
               title: "Integration Test Video",
               youtube_id: "abc123"
             }
           },
           headers: { "Authorization" => "Bearer #{token}" },
           as: :json
    end

    assert_response :success

    micropost = Micropost.last

    assert_equal @user.id, micropost.user_id
    # assert_equal "Integration Test Video", micropost.title
  end
end