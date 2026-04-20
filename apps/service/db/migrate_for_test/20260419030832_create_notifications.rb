class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    # 1. enum (snake_case)
    create_enum :notification_type, %w[like follow comment]

    # 2. table
    create_table :notifications do |t|
      t.bigint :recipient_id, null: false
      t.bigint :issuer_id, null: false
      t.bigint :post_id

      t.column :notification_type, :notification_type, null: false

      t.boolean :read, default: false, null: false
      t.timestamps
    end

    # 3. foreign keys
    add_foreign_key :notifications, :users, column: :recipient_id, on_delete: :cascade
    add_foreign_key :notifications, :users, column: :issuer_id, on_delete: :cascade
    add_foreign_key :notifications, :microposts, column: :post_id, on_delete: :cascade

    # 4. index
    add_index :notifications, :recipient_id
    add_index :notifications, :issuer_id
    add_index :notifications, :post_id
  end
end
