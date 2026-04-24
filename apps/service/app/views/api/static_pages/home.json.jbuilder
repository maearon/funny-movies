json.feed_items do
  json.array!(@feed_items) do |i|
    json.id i.id
    json.user_name i.user.name
    json.user_id i.user_id
    json.gravatar_id Digest::MD5::hexdigest((i.user.email || "").downcase)
    json.size 50
    json.content i.content
    json.title i.title
    json.youtube_id i.youtube_id
    json.image i.image.attached? ? i.image.url : nil
    json.timestamp time_ago_in_words(i.created_at)
  end
end
json.total_count @feed_items.total_count
json.following @current_user.following.count
json.followers @current_user.followers.count
json.micropost @current_user.microposts.count
json.gravatar Digest::MD5::hexdigest((@current_user.email || "").downcase)