class Api::MicropostsController < Api::ApiController
  before_action :authenticate!
  before_action :correct_user, only: :destroy

  def create
    # @micropost = Micropost.new(micropost_params)
    @micropost = Micropost.new(micropost_params.except(:image))
    @micropost.image.attach(params[:micropost][:image]) if params[:micropost] && params[:micropost][:image].present?
    @micropost.content = micropost_params[:content] if micropost_params[:content].present?
    @micropost.user_id = current_user.id if current_user.present?
    # @micropost.user_id = current_user.id

    if @micropost.save
      NotifyUsersJob.perform_later(@micropost.id)
      render json: { flash: [ "success", "Micropost created!" ] }
    else
      render json: { error: @micropost.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @micropost.destroy
    render json: { flash: [ "success", "Micropost deleted" ] }
  end

  private

  def micropost_params
    params.require(:micropost).permit(:content, :title, :youtube_id, :image)
  end

  def correct_user
    @micropost = current_user.microposts.find_by(id: params[:id])
    render json: { error: [ "Micropost not found" ] }, status: :not_found unless @micropost
  end
end
