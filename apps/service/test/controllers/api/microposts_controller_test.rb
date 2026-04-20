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

  # =========================
  # CREATE VALIDATION
  # =========================
  test "create micropost fails with invalid params" do
    assert_no_difference "Micropost.count" do
      post api_microposts_url,
          params: {
            micropost: {
              content: "",
              title: "",
              youtube_id: ""
            }
          },
          headers: { "Authorization" => "Bearer #{@token}" },
          as: :json
    end

    assert_response :unprocessable_entity # assert_response :success # ⚠️ controller haven't yet 422
    json = JSON.parse(response.body)
    assert json["error"].present?
  end

  # =========================
  # CREATE SUCCESS
  # =========================
  test "create micropost actually creates record" do
    assert_difference "Micropost.count", 1 do
      post api_microposts_url,
          params: {
            micropost: {
              content: "https://youtube.com/watch?v=abc",
              title: "Test video",
              youtube_id: "abc"
            }
          },
          headers: { "Authorization" => "Bearer #{@token}" },
          as: :json
    end

    assert_response :success
  end

  # =========================
  # DESTROY
  # =========================
  test "destroy deletes own micropost" do
    micropost = Micropost.create!(
      content: "https://youtube.com/watch?v=abc",
      title: "Test",
      youtube_id: "abc",
      user_id: @user.id
    )

    assert_difference "Micropost.count", -1 do
      delete api_micropost_url(micropost.id),
            headers: { "Authorization" => "Bearer #{@token}" },
            as: :json
    end

    assert_response :success
  end

  # =========================
  # DESTROY UNAUTHORIZED USER
  # =========================
  test "destroy fails when not owner" do
    other_user = users(:two)

    micropost = Micropost.create!(
      content: "https://youtube.com/watch?v=abc",
      title: "Test",
      youtube_id: "abc",
      user_id: other_user.id
    )

    assert_no_difference "Micropost.count" do
      delete api_micropost_url(micropost.id),
            headers: { "Authorization" => "Bearer #{@token}" },
            as: :json
    end

    assert_response :not_found
  end

  # =========================
  # DESTROY NOT FOUND
  # =========================
  test "destroy returns not found for non-existing micropost" do
    delete api_micropost_url("nonexistent"),
          headers: { "Authorization" => "Bearer #{@token}" },
          as: :json

    assert_response :not_found
  end
end

