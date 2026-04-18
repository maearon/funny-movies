class User < ApplicationRecord
  has_many :microposts, dependent: :destroy

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