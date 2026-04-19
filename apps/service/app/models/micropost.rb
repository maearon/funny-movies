class Micropost < ApplicationRecord
  belongs_to :user

  # validations
  validates :content, presence: true
  validates :title, presence: true
  validates :youtube_id, presence: true

  # order newest first
  default_scope -> { order(created_at: :desc) }
end