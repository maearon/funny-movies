require "test_helper"

class MicropostTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @micropost = Micropost.new(
      content: "https://www.youtube.com/watch?v=abc123",
      title: "Test Video",
      youtube_id: "abc123",
      user: @user
    )
  end

  # =========================
  # VALID
  # =========================
  test "should be valid" do
    assert @micropost.valid?
  end

  # =========================
  # VALIDATIONS
  # =========================
  test "content should be present" do
    @micropost.content = ""
    assert_not @micropost.valid?
  end

  test "title should be present" do
    @micropost.title = ""
    assert_not @micropost.valid?
  end

  test "youtube_id should be present" do
    @micropost.youtube_id = ""
    assert_not @micropost.valid?
  end

  test "user must exist" do
    @micropost.user = nil
    assert_not @micropost.valid?
  end

  # =========================
  # ASSOCIATION
  # =========================
  test "should belong to user" do
    assert_respond_to @micropost, :user
  end

  # =========================
  # DEFAULT SCOPE
  # =========================
  test "should order newest first" do
    older = Micropost.create!(
      content: "old",
      title: "old",
      youtube_id: "old",
      user: @user,
      created_at: 1.day.ago
    )

    newer = Micropost.create!(
      content: "new",
      title: "new",
      youtube_id: "new",
      user: @user,
      created_at: Time.current
    )

    assert_equal newer, Micropost.first
  end
end