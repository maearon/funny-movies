require "test_helper"

class RelationshipTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @other = users(:two)

    @relationship = Relationship.new(
      follower: @user,
      followed: @other
    )
  end

  # =========================
  # VALID
  # =========================
  test "should be valid" do
    assert @relationship.valid?
  end

  # =========================
  # VALIDATIONS
  # =========================
  test "follower must be present" do
    @relationship.follower = nil
    assert_not @relationship.valid?
  end

  test "followed must be present" do
    @relationship.followed = nil
    assert_not @relationship.valid?
  end

  # =========================
  # ASSOCIATIONS
  # =========================
  test "should belong to follower" do
    assert_respond_to @relationship, :follower
  end

  test "should belong to followed" do
    assert_respond_to @relationship, :followed
  end

  # =========================
  # BUSINESS LOGIC
  # =========================
  test "should not allow self follow" do
    @relationship.followed = @user
    assert_not @relationship.valid?
  end

  test "should not allow duplicate relationship" do
    @relationship.save!
    duplicate = @relationship.dup

    assert_not duplicate.valid?
  end
end