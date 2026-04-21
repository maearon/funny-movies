require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  test "account activation email" do
    user = users(:one)
    mail = UserMailer.account_activation(user)

    assert_equal [user.email], mail.to
    assert_equal "Account activation", mail.subject
    assert_match user.name, mail.body.encoded
  end

  test "password reset email" do
    user = users(:one)
    mail = UserMailer.password_reset(user)

    assert_equal [user.email], mail.to
    assert_equal "Password reset", mail.subject
    assert_match "To reset your password", mail.body.encoded
  end
end
