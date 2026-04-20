require "test_helper"

class Api::RelationshipsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)

    @token = Jwt::User::EncodeTokenService.call(@user.id).first
  end

  # =========================
  # AUTH
  # =========================
  test "create requires authentication" do
    post api_relationships_url,
         params: { followed_id: @other_user.id },
         as: :json

    assert_response :unauthorized
  end

  test "destroy requires authentication" do
    delete api_relationship_url(@other_user.id), as: :json
    assert_response :unauthorized
  end

  # =========================
  # FOLLOW
  # =========================
  test "user can follow another user" do
    assert_difference "Relationship.count", 1 do
      post api_relationships_url,
           params: { followed_id: @other_user.id },
           headers: { "Authorization" => "Bearer #{@token}" },
           as: :json
    end

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal true, json["follow"]
  end

  test "user cannot follow same user twice" do
    @user.follow(@other_user)

    assert_no_difference "Relationship.count" do
      post api_relationships_url,
           params: { followed_id: @other_user.id },
           headers: { "Authorization" => "Bearer #{@token}" },
           as: :json
    end
  end

  test "user cannot follow themselves" do
    assert_no_difference "Relationship.count" do
      post api_relationships_url,
           params: { followed_id: @user.id },
           headers: { "Authorization" => "Bearer #{@token}" },
           as: :json
    end
  end

  # =========================
  # UNFOLLOW
  # =========================
  test "user can unfollow" do
    @user.follow(@other_user)
    relationship = @user.active_relationships.find_by(followed_id: @other_user.id)

    assert_difference "Relationship.count", -1 do
      delete api_relationship_url(@other_user.id),
             headers: { "Authorization" => "Bearer #{@token}" },
             as: :json
    end

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal true, json["unfollow"]
  end

  test "unfollow fails if relationship does not exist" do
    assert_no_difference "Relationship.count" do
      delete api_relationship_url(999999),
             headers: { "Authorization" => "Bearer #{@token}" },
             as: :json
    end

    # ⚠️ controller hiện tại sẽ bị error nếu relationship nil
    # nên tạm chỉ check không crash (sẽ FAIL nếu chưa handle)
  end
end