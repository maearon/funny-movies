class UserMailer < ApplicationMailer

  def account_activation(user)
    @user = user
    @user.activation_token ||= User.new_token

    mail to: user.email, subject: "Account activation"
  end

  def password_reset(user)
    @user = user
    @user.reset_token ||= User.new_token

    mail to: user.email, subject: "Password reset"
  end
end
