require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
  end

  # =========================
  # VALIDATIONS
  # =========================
  test "should be valid" do
    assert @user.valid?
  end

  test "name should be present" do
    @user.name = ""
    assert_not @user.valid?
  end

  test "email should be present" do
    @user.email = ""
    assert_not @user.valid?
  end

  test "email should be unique" do
    duplicate = @user.dup
    duplicate.email = @user.email.upcase

    @user.save
    assert_not duplicate.valid?
  end

  test "password should have minimum length" do
    @user.password = "123"
    @user.password_confirmation = "123"

    assert_not @user.valid?
  end

  # =========================
  # AUTH / PASSWORD
  # =========================
  test "valid password should authenticate" do
    @user.password = "password"
    @user.password_confirmation = "password"
    @user.save

    assert @user.valid_password?("password")
  end

  test "invalid password should not authenticate" do
    assert_not @user.valid_password?("wrong")
  end

  # =========================
  # FOLLOW SYSTEM
  # =========================
  test "should follow another user" do
    other = users(:two)

    assert_not @user.following.include?(other)
    @user.follow(other)

    assert @user.following.include?(other)
  end

  test "should not follow self" do
    @user.follow(@user)

    assert_not @user.following.include?(@user)
  end

  test "should unfollow user" do
    other = users(:two)

    @user.follow(other)
    assert @user.following.include?(other)

    @user.unfollow(other)
    assert_not @user.following.include?(other)
  end

  # =========================
  # TOKEN LOGIC
  # =========================
  test "generate_tokens! should set refresh token" do
    @user.generate_tokens!
    @user.reload

    assert_not_nil @user.refresh_token
    assert_not_nil @user.refresh_token_expiration_at
  end

  test "revoke_refresh_token! should clear token" do
    @user.generate_tokens!
    @user.revoke_refresh_token!
    @user.reload

    assert_nil @user.refresh_token
  end

  test "refresh token should expire" do
    @user.generate_tokens!
    @user.update(refresh_token_expiration_at: 1.hour.ago)

    assert @user.refresh_token_expiration_at < Time.current
  end
end