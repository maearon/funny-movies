# Use stable Ruby image
FROM ruby:4.0.2

# Install Node.js and Yarn using corepack
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable

# Install base dependencies
RUN apt-get install -y \
    libvips-dev \
    build-essential \
    libpq-dev \
    # dos2unix \
    git && \
    apt-get clean autoclean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN adduser --disabled-login --gecos "" appuser

# App directory
RUN mkdir -p /app && chown -R appuser:appuser /app
WORKDIR /app

# Copy only Gemfile first for layer caching
COPY ./apps/service/Gemfile ./apps/service/Gemfile.lock ./
RUN gem install bundler && bundle install --jobs=4 --retry=3

# Copy app source
COPY ./apps/service ./ 
# RUN apt-get install -y dos2unix nano

# Ensure Rails binstubs are executable
RUN chmod +x bin/* || true

# Copy entrypoint
COPY ./apps/service/entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

# Use entrypoint to handle pid cleanup
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

# Precompile assets if production
ARG RAILS_ENV=development
ENV RAILS_ENV=${RAILS_ENV}
RUN if [ "$RAILS_ENV" = "production" ]; then \
      SECRET_KEY_BASE=d5fb62869cd8fc84aefc28d664dd2395132784d41e903dc259ed7e34273e76c5b5066cd98649f057c976bc108c97c5a5a50bc7ff40289def6b68c5094e19cd55 bundle exec rake assets:precompile; \
    fi

# Expose port
EXPOSE 3000

# Default command
CMD ["rails", "server", "-b", "0.0.0.0"]

# Healthcheck for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/up || exit 1