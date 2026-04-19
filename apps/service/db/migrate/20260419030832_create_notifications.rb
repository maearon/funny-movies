class CreateNotifications < ActiveRecord::Migration[8.1]
  # def change
  #   # 1. Create enum type
  #   create_enum :NotificationType, ["LIKE", "FOLLOW", "COMMENT"]

  #   # 2. Create table
  #   create_table :notifications, id: :string do |t|
  #     t.string  :recipientId, null: false
  #     t.string  :issuerId, null: false
  #     t.string  :postId
  #     t.enum    :type, enum_type: :NotificationType, null: false
  #     t.boolean :read, default: false, null: false

  #     t.datetime :created_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
  #   end

  #   # 3. Foreign keys
  #   add_foreign_key :notifications, :users, column: :recipientId, on_delete: :cascade
  #   add_foreign_key :notifications, :users, column: :issuerId, on_delete: :cascade
  #   add_foreign_key :notifications, :posts, column: :postId, on_delete: :cascade

  #   # 4. Index (recommended for foreign keys)
  #   add_index :notifications, :recipientId
  #   add_index :notifications, :issuerId
  #   add_index :notifications, :postId
  # end
end

# model Notification {
#   id          String           @id @default(cuid())
#   recipientId String
#   recipient   User             @relation("Recipient", fields: [recipientId], references: [id], onDelete: Cascade)
#   issuerId    String
#   issuer      User             @relation("Issuer", fields: [issuerId], references: [id], onDelete: Cascade)
#   postId      String?
#   post        Post?            @relation(fields: [postId], references: [id], onDelete: Cascade)
#   type        NotificationType
#   read        Boolean          @default(false)

#   createdAt DateTime @default(now())

#   @@map("notifications")
# }

# enum NotificationType {
#   LIKE
#   FOLLOW
#   COMMENT
# }

# SELECT e.enumlabel
# FROM pg_enum e
# JOIN pg_type t ON e.enumtypid = t.oid
# WHERE t.typname = 'NotificationType';

# DO $$
# BEGIN
#   IF NOT EXISTS (
#     SELECT 1
#     FROM pg_enum e
#     JOIN pg_type t ON e.enumtypid = t.oid
#     WHERE t.typname = 'NotificationType'
#       AND e.enumlabel = 'VIDEO_SHARED'
#   ) THEN
#     ALTER TYPE "NotificationType" ADD VALUE 'VIDEO_SHARED';
#   END IF;
# END
# $$;
