module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      reject_unauthorized_connection unless current_user
    end

    private

    def find_verified_user
      token = request.params[:token].presence
      return nil if token.blank?

      user_id = Jwt::User::DecodeTokenService.call("Bearer #{token}")
      User.find_by(id: user_id) if user_id
    end
  end
end
