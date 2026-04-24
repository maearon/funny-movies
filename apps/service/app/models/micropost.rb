class Micropost < ApplicationRecord
  belongs_to :user

  # validations
  validates :content, presence: true, length: { maximum: 140 }
  validates :title, presence: true
  validates :youtube_id, presence: true
  validates :user_id, presence: true
  validates :image,   content_type: { in: %w[image/jpeg image/gif image/png],
                                      message: "must be a valid image format" },
                      size: { less_than: 5.megabytes,
                              message:   "should be less than 5MB" }

  # image attachment
  has_one_attached :image, dependent: :purge_later do |attachable|
    attachable.variant :display, resize_to_limit: [500, 500]
  end

  # order newest first
  default_scope -> { order(created_at: :desc) }
end