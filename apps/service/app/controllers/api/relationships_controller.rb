class Api::RelationshipsController < Api::ApiController
  before_action :authenticate!

  def create
    user = User.find(params[:followed_id])
    render json: { follow: true } if current_user.follow(user)
  end

  def destroy
    relationship = current_user.active_relationships.find_by(followed_id: params[:id])

    return render json: { error: ["Not following"] }, status: :not_found if relationship.nil?

    user = relationship.followed

    if current_user.unfollow(user)
      render json: { unfollow: true }
    end
  end
end