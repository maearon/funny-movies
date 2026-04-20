require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @user.update(
      password: "password",
      password_confirmation: "password",
      activated: true
    )
    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  # =========================
  # LOGIN
  # =========================
  test "login success returns tokens" do
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
  end

  test "login fails with wrong password" do
    post api_login_url,
         params: {
           session: {
             email: @user.email,
             password: "wrong"
           }
         },
         as: :json

    assert_response :unauthorized
  end

  test "login fails when user not activated" do
    @user.update(activated: false)

    post api_login_url,
         params: {
           session: {
             email: @user.email,
             password: "password"
           }
         },
         as: :json

    assert_response :unauthorized
  end

  # =========================
  # INDEX (auth required)
  # =========================
  test "index requires authentication" do
    get api_sessions_url, as: :json
    assert_response :unauthorized
  end

  test "index works with token" do
    token = Jwt::User::EncodeTokenService.call(@user.id).first

    get api_sessions_url,
        headers: { "Authorization" => "Bearer #{token}" },
        as: :json

    assert_response :success
  end

  # =========================
  # LOGOUT
  # =========================
  test "logout revokes refresh token" do
    @user.generate_tokens!
    token = Jwt::User::EncodeTokenService.call(@user.id).first

    delete api_logout_url,
           headers: { "Authorization" => "Bearer #{token}" },
           as: :json

    assert_response :success

    @user.reload
    assert_nil @user.refresh_token
  end

  # =========================
  # REFRESH TOKEN
  # =========================
  test "refresh returns new tokens when valid" do
    @user.generate_tokens!

    post api_refresh_url,
         params: {
           auth: {
             refresh_token: @user.refresh_token
           }
         },
         headers: { "Authorization" => "Bearer #{@token}" },
         as: :json

    assert_response :success
  end

  test "refresh fails when token invalid" do
    post api_refresh_url,
         params: {
           auth: {
             refresh_token: "invalid"
           }
         },
         as: :json

    assert_response :unauthorized
  end

  test "refresh fails when token expired" do
    @user.generate_tokens!
    @user.update(refresh_token_expiration_at: 1.hour.ago)

    post api_refresh_url,
         params: {
           auth: {
             refresh_token: @user.refresh_token
           }
         },
         as: :json

    assert_response :unauthorized
  end

  # =========================
  # REVOKE TOKEN
  # =========================
  test "revoke invalidates refresh token" do
    @user.generate_tokens!

    post api_revoke_url,
         params: {
           auth: {
             refresh_token: @user.refresh_token
           }
         },
         headers: { "Authorization" => "Bearer #{@token}" },
         as: :json

    assert_response :success

    @user.reload
    assert_nil @user.refresh_token
  end

  test "revoke still returns success if token invalid" do
    post api_revoke_url,
         params: {
           auth: {
             refresh_token: "invalid"
           }
         },
         headers: { "Authorization" => "Bearer #{@token}" },
         as: :json

    assert_response :success
  end
end