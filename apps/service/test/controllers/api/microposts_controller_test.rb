require "test_helper"

class Api::MicropostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  test "create micropost requires authentication" do
    assert_no_difference "Micropost.count" do
      post api_microposts_url,
           params: {
             micropost: {
               content: "https://www.youtube.com/watch?v=pRdv7lDoqIo",
               title: "Test",
               youtube_id: "pRdv7lDoqIo"
             }
           },
           as: :json
    end
    assert_response :unauthorized
  end

  test "create micropost enqueues notify job when authorized" do
    assert_enqueued_jobs 1, only: NotifyUsersJob do
      post api_microposts_url,
           params: {
             micropost: {
               content: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
               title: "Me at the zoo",
               youtube_id: "jNQXAC9IVRw"
             }
           },
           headers: { "Authorization" => "Bearer #{@token}" },
           as: :json
    end
    assert_response :success
  end
end
