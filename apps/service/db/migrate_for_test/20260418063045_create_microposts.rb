class CreateMicroposts < ActiveRecord::Migration[8.1]
  def change
    create_table :microposts do |t|
      t.string :content
      t.string :title
      t.string :youtube_id
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_index :microposts, [:user_id, :created_at]
  end
end
