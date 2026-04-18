class Api::MicropostsController < Api::ApiController
  before_action :authenticate!, except: %i[create]
  before_action :correct_user,   only: :destroy
  def create
    @micropost = Micropost.new(micropost_params)
    @micropost.user_id = current_user.id if current_user.present?
    if @micropost.save
      render json: { flash: ["success", "Micropost created!"] }
    else
      render json: { error: @micropost.errors.full_messages }
    end
  end
  def destroy
    @micropost.destroy
    render json: { flash: ["success", "Micropost deleted"] }
  end
  private
    def micropost_params
      params.require(:micropost).permit(:content, :title, :youtube_id)
    end
    def correct_user
      @micropost = current_user.microposts.find_by(id: params[:id])
      render json: { flash: ["success", "Micropost with id = #{params[:id]} not found!"] } if @micropost.nil?
    end
end