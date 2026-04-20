# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_20_134004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "notification_type", ["like", "follow", "comment"]

  create_table "microposts", force: :cascade do |t|
    t.string "content"
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "youtube_id"
    t.index ["user_id", "created_at"], name: "index_microposts_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_microposts_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "issuer_id", null: false
    t.enum "notification_type", null: false, enum_type: "notification_type"
    t.bigint "post_id"
    t.boolean "read", default: false, null: false
    t.bigint "recipient_id", null: false
    t.datetime "updated_at", null: false
    t.index ["issuer_id"], name: "index_notifications_on_issuer_id"
    t.index ["post_id"], name: "index_notifications_on_post_id"
    t.index ["recipient_id"], name: "index_notifications_on_recipient_id"
  end

  create_table "relationships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "followed_id"
    t.integer "follower_id"
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.boolean "activated", default: false
    t.datetime "activated_at"
    t.string "activation_digest"
    t.boolean "admin", default: false
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name"
    t.string "password_digest"
    t.string "refresh_token"
    t.datetime "refresh_token_expiration_at"
    t.string "remember_digest"
    t.string "reset_digest"
    t.datetime "reset_sent_at"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "microposts", "users"
  add_foreign_key "notifications", "microposts", column: "post_id", on_delete: :cascade
  add_foreign_key "notifications", "users", column: "issuer_id", on_delete: :cascade
  add_foreign_key "notifications", "users", column: "recipient_id", on_delete: :cascade
end
