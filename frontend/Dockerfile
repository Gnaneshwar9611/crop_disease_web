FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Pass the backend URL at runtime via NEXT_PUBLIC_API_URL env var
# (set in docker-compose.yml so it points to the backend service)
ENV NEXT_PUBLIC_API_URL=http://backend:8000

CMD ["npm", "run", "dev"]
