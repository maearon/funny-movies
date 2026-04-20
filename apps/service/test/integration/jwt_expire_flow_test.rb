require "test_helper"

class JwtExpireFlowTest < ActionDispatch::IntegrationTest
  include ActiveSupport::Testing::TimeHelpers

  def setup
    @user = users(:one)
    @user.update(
      password: "password",
      password_confirmation: "password",
      activated: true
    )
  end

  test "token becomes invalid after expiration" do
    user = users(:one)
    token = Jwt::User::EncodeTokenService.call(user.id).first

    travel 2.hours do
      get api_sessions_url,
          headers: { "Authorization" => "Bearer #{token}" },
          as: :json

      assert_response :unauthorized
    end
  end

  test "request fails when JWT is expired" do
    expired_token = generate_expired_token(@user.id)

    get api_sessions_url,
        headers: { "Authorization" => "Bearer #{expired_token}" },
        as: :json

    assert_response :unauthorized
  end

  test "request succeeds with valid token" do
    token = Jwt::User::EncodeTokenService.call(@user.id).first

    get api_sessions_url,
        headers: { "Authorization" => "Bearer #{token}" },
        as: :json

    assert_response :success
  end

  test "request fails with tampered token" do
    token = Jwt::User::EncodeTokenService.call(@user.id).first + "abc"

    get api_sessions_url,
        headers: { "Authorization" => "Bearer #{token}" },
        as: :json

    assert_response :unauthorized
  end

  private

  def generate_expired_token(user_id)
    payload = {
      user_id: user_id,
      exp: 1.hour.ago.to_i # 🔥 expired
    }

    JWT.encode(payload, Rails.application.secret_key_base)
  end
end