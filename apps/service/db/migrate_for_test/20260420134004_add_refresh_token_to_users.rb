class AddRefreshTokenToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :refresh_token, :string
    add_column :users, :refresh_token_expiration_at, :datetime
  end
end
