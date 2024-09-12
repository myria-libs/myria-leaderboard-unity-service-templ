# Stage 1: Build the application
FROM node:20

WORKDIR /app

# Copy application source code
COPY . .

# Install dependencies
RUN yarn install

# Build the application
RUN yarn build:prod

# Start the application
CMD [ "yarn", "start:dev" ]
