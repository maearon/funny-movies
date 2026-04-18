class User < ApplicationRecord
  # Associations
  include RefreshTokenUpdatable
  # == Associations
  has_many :microposts, dependent: :destroy

  # accessor for tokens
  attr_accessor :token, :token_expiration_at, :remember_token, :activation_token, :reset_token

  # Follow system
  has_many :active_relationships,
           class_name: "Relationship",
           foreign_key: "follower_id",
           dependent: :destroy

  has_many :passive_relationships,
           class_name: "Relationship",
           foreign_key: "followed_id",
           dependent: :destroy

  has_many :following, through: :active_relationships, source: :followed
  has_many :followers, through: :passive_relationships, source: :follower

  # Notifications
  has_many :received_notifications,
           class_name: "Notification",
           foreign_key: "recipient_id",
           dependent: :destroy

  has_many :sent_notifications,
           class_name: "Notification",
           foreign_key: "issuer_id",
           dependent: :destroy

  # Auth basic
  has_secure_password

  before_save :downcase_email

  # Validations
  validates :name, presence: true, length: { maximum: 50 }

  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email,
            presence: true,
            uniqueness: true,
            format: { with: VALID_EMAIL_REGEX }

  validates :password,
            presence: true,
            length: { minimum: 6 },
            allow_nil: true

  # Feed logic
  def feed
    following_ids = "SELECT followed_id FROM relationships WHERE follower_id = :user_id"

    Micropost.where("user_id IN (#{following_ids}) OR user_id = :user_id", user_id: id)
             .includes(:user)
             .order(created_at: :desc)
  end

  # Token generation
  def generate_tokens!
    access_token, access_token_expiration_at, refresh_token, refresh_token_expiration_at = Jwt::User::EncodeTokenService.call(id)
    update_refresh_token!(refresh_token, refresh_token_expiration_at)
    self.token = access_token
    self.token_expiration_at = access_token_expiration_at
  end

  # Returns the hash digest of the given string.
  def User.digest(string)
    cost = ActiveModel::SecurePassword.min_cost ? BCrypt::Engine::MIN_COST :
                                                  BCrypt::Engine.cost
    BCrypt::Password.create(string, cost: cost)
  end

  # Returns a random token.
  def User.new_token
    SecureRandom.urlsafe_base64
  end

  # Sets the password reset attributes.
  def create_reset_digest
    self.reset_token = User.new_token
    update_attribute(:reset_digest,  User.digest(reset_token))
    update_attribute(:reset_sent_at, Time.zone.now)
  end

  # Sends password reset email.
  def send_password_reset_email
    UserMailer.password_reset(self).deliver_now
  end

  # Returns true if the given token matches the digest.
  def valid_password?(password)
    authenticate(password)
  end

  def authenticated?(attribute, token)
    digest = send("#{attribute}_digest")
    return false if digest.nil?
    BCrypt::Password.new(digest).is_password?(token)
  end

  # Follow logic
  def follow(other_user)
    following << other_user unless self == other_user
  end

  def unfollow(other_user)
    following.delete(other_user)
  end

  def following?(other_user)
    following.include?(other_user)
  end

  private

  def downcase_email
    self.email = email.downcase
  end
end