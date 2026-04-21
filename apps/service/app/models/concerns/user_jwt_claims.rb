module UserJwtClaims
  extend ActiveSupport::Concern

  ALGORITHM = 'HS512'.freeze
  ISS = 'http://localhost'.freeze
  SUB = 'service-user'.freeze
  AUD = ['http://localhost'].freeze
  ACCESS_TOKEN_EXPIRATION = 14.days
  ACCESS_TOKEN_EXPIRATION_FOR_DEV = 24.hours
  REFRESH_TOKEN_EXPIRATION = 30.days
  REFRESH_TOKEN_EXPIRATION_FOR_DEV = 30.days
end