# Multi-stage build for an integrated solution

# ---- Backend builder stage ----
FROM python:3.11.9 AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcurl4-openssl-dev \
    libssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies first (for better caching)
COPY ./backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# ---- Frontend builder stage ----
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy and install dependencies
COPY ./frontend/package*.json ./
RUN npm install

# Copy source code
COPY ./frontend .

# Build the frontend application
ARG REACT_APP_API_BASE_URL=http://localhost:8000
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build

# ---- Backend final stage ----
FROM python:3.11.9 AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder stage
COPY --from=backend-builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy the rest of the application
COPY ./backend .

# Create a non-root user
RUN useradd -m appuser
USER appuser

# Expose the port
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000 || exit 1

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ---- Frontend final stage ----
FROM nginx:alpine AS frontend

# Copy custom nginx config
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from frontend builder stage
COPY --from=frontend-builder /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Expose port 80
EXPOSE 80
