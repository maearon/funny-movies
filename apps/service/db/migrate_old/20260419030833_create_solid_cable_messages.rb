CREATE TABLE solid_cable_messages (
  id BIGSERIAL PRIMARY KEY,
  channel BYTEA NOT NULL,
  payload BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL,
  channel_hash BIGINT NOT NULL
);

CREATE INDEX index_solid_cable_messages_on_channel
ON solid_cable_messages (channel);

CREATE INDEX index_solid_cable_messages_on_channel_hash
ON solid_cable_messages (channel_hash);

CREATE INDEX index_solid_cable_messages_on_created_at
ON solid_cable_messages (created_at);