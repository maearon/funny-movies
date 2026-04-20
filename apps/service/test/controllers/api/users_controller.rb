require "test_helper"

class Api::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)

    @user.update(password: "password", password_confirmation: "password")

    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  def auth_headers(user = @user)
    token = Jwt::User::EncodeTokenService.call(user.id).first
    { "Authorization" => "Bearer #{token}" }
  end

  # =========================
  # CREATE (REGISTER)
  # =========================
  # test "create user success" do
  #   assert_difference "User.count", 1 do
  #     post api_users_url,
  #          params: {
  #            user: {
  #              name: "Test User",
  #              email: "test@example.com",
  #              password: "password",
  #              password_confirmation: "password"
  #            }
  #          },
  #          as: :json
  #   end

  #   assert_response :success
  # end

  # test "create user fails with invalid data" do
  #   assert_no_difference "User.count" do
  #     post api_users_url,
  #          params: {
  #            user: {
  #              name: "",
  #              email: "",
  #              password: "123",
  #              password_confirmation: "456"
  #            }
  #          },
  #          as: :json
  #   end

  #   assert_response :unprocessable_entity
  # end

  # =========================
  # INDEX
  # =========================
  test "index requires authentication" do
    get api_users_url, as: :json
    assert_response :unauthorized
  end

  # test "index works with auth" do
  #   get api_users_url,
  #       headers: auth_headers,
  #       as: :json

  #   assert_response :success
  # end

  # =========================
  # SHOW
  # =========================
  test "show requires authentication" do
    get api_user_url(@user.id), as: :json
    assert_response :unauthorized
  end

  test "show works with auth" do
    get api_user_url(@user.id),
        headers: auth_headers,
        as: :json

    assert_response :success
  end

  # =========================
  # UPDATE
  # =========================
  # test "user can update own profile" do
  #   patch api_user_url(@user.id),
  #         params: {
  #           user: { name: "Updated Name" }
  #         },
  #         headers: auth_headers,
  #         as: :json

  #   assert_response :success
  #   @user.reload
  #   assert_equal "Updated Name", @user.name
  # end

  # test "user cannot update other user" do
  #   patch api_user_url(@other_user.id),
  #         params: {
  #           user: { name: "Hack" }
  #         },
  #         headers: auth_headers,
  #         as: :json

  #   assert_response :forbidden
  # end

  # =========================
  # DESTROY
  # =========================
  test "non-admin cannot delete user" do
    assert_no_difference "User.count" do
      delete api_user_url(@user.id),
             headers: auth_headers,
             as: :json
    end

    assert_response :forbidden
  end

  # test "admin can delete user" do
  #   admin = users(:admin)
  #   admin.update(admin: true)
  #   headers = auth_headers(admin)

  #   assert_difference "User.count", -1 do
  #     delete api_user_url(@user.id),
  #            headers: headers,
  #            as: :json
  #   end

  #   assert_response :success
  # end

  # =========================
  # FOLLOWING / FOLLOWERS
  # =========================
  test "following requires auth" do
    get following_api_user_url(@user.id), as: :json
    assert_response :unauthorized
  end

  test "followers requires auth" do
    get followers_api_user_url(@user.id), as: :json
    assert_response :unauthorized
  end

  test "following works with auth" do
    get following_api_user_url(@user.id),
        headers: auth_headers,
        as: :json

    assert_response :success
  end

  test "followers works with auth" do
    get followers_api_user_url(@user.id),
        headers: auth_headers,
        as: :json

    assert_response :success
  end
end

# require "test_helper"

# class Api::MicropostsControllerTest < ActionDispatch::IntegrationTest
#   setup do
#     @api_micropost = api_microposts(:one)
#   end

#   test "should get index" do
#     get api_microposts_url, as: :json
#     assert_response :success
#   end

#   test "should create api_micropost" do
#     assert_difference("Api::Micropost.count") do
#       post api_microposts_url, params: { api_micropost: {} }, as: :json
#     end

#     assert_response :created
#   end

#   test "should show api_micropost" do
#     get api_micropost_url(@api_micropost), as: :json
#     assert_response :success
#   end

#   test "should update api_micropost" do
#     patch api_micropost_url(@api_micropost), params: { api_micropost: {} }, as: :json
#     assert_response :success
#   end

#   test "should destroy api_micropost" do
#     assert_difference("Api::Micropost.count", -1) do
#       delete api_micropost_url(@api_micropost), as: :json
#     end

#     assert_response :no_content
#   end
# end