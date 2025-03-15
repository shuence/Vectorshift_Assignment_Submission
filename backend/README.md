# Integration Technical Assessment Backend ✅

A FastAPI backend for OAuth2 integration with several services including Airtable, Notion, and HubSpot (All Completed).

## Environment Configuration

The application uses environment variables for configuration. Copy the provided `.env.example` file to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Key environment variables:

- `REDIS_HOST`: Redis server hostname (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `HUBSPOT_CLIENT_ID`: OAuth client ID for HubSpot
- `HUBSPOT_CLIENT_SECRET`: OAuth client secret for HubSpot
- `AIRTABLE_CLIENT_ID`: OAuth client ID for Airtable
- `AIRTABLE_CLIENT_SECRET`: OAuth client secret for Airtable
- `NOTION_CLIENT_ID`: OAuth client ID for Notion
- `NOTION_CLIENT_SECRET`: OAuth client secret for Notion

## Running with Docker

### Prerequisites

- Docker and Docker Compose installed on your machine

### Steps to run

1. Build and start the containers:

   ```bash
   docker-compose up --build
   ```

2. The API will be available at: <http://localhost:8000>

3. To stop the application:

   ```bash
   docker-compose down
   ```

## Development

To run the application in development mode without Docker:

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Ensure Redis is running locally at `localhost:6379`

3. Start the application:

   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints (All Implemented ✅)

The API exposes several endpoints for each integration:

- Airtable ✅
  - `/integrations/airtable/authorize`
  - `/integrations/airtable/oauth2callback`
  - `/integrations/airtable/credentials`
  - `/integrations/airtable/load`

- Notion ✅
  - `/integrations/notion/authorize`
  - `/integrations/notion/oauth2callback`
  - `/integrations/notion/credentials`
  - `/integrations/notion/load`

- HubSpot ✅
  - `/integrations/hubspot/authorize`
  - `/integrations/hubspot/oauth2callback`
  - `/integrations/hubspot/credentials`
  - `/integrations/hubspot/get_hubspot_items`

### Common Features

- Rate limiting: 100 requests per minute
- Input validation on all endpoints
- Error response format:

  ```json
  {
    "error": "string",
    "message": "string",
    "details": {}
  }
  ```

### Security Features

1. Request signing validation
2. Rate limiting per IP and user
3. Input sanitization
4. OAuth state validation
5. Credential encryption

### Error Handling

1. Automatic retry for transient failures
2. Detailed error logging
3. Graceful degradation
4. Circuit breaker pattern
