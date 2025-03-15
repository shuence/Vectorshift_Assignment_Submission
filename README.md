# VectorShift Integration Technical Assessment

An integration dashboard demonstrating OAuth2 flows and API integrations with HubSpot, Notion, and Airtable, with a specific focus on implementing the HubSpot integration.

## Assessment Overview ✅

This assessment consists of two main parts (Both Completed):

1. **HubSpot OAuth Integration Implementation ✅**
   - Complete the backend OAuth flow in `backend/integrations/hubspot.py` ✅
   - Implement frontend integration in `frontend/src/integrations/hubspot.js` ✅
   - Connect UI components to make HubSpot integration accessible ✅

2. **HubSpot Data Integration ✅**
   - Implement `get_items_hubspot` function to fetch and transform HubSpot data ✅
   - Return data as IntegrationItem objects ✅
   - Display integration items in the frontend ✅

## Project Structure

```bash
.
├── backend/
│   ├── integrations/
│   │   ├── airtable.py      # Completed
│   │   ├── notion.py        # Completed
│   │   ├── hubspot.py       # Completed ✅
│   │   └── integration_item.py
│   └── main.py              # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── integrations/
│   │   │   ├── airtable.js  # Completed
│   │   │   ├── notion.js    # Completed
│   │   │   └── hubspot.js   # Completed ✅
│   │   └── components/
│   └── package.json
└── docker-compose.yml
```

## Implementation Requirements

### Backend (Python/FastAPI)

Required implementations in `backend/integrations/hubspot.py`:

1. **authorize_hubspot(user_id: str, org_id: str)**
   - Initialize OAuth flow
   - Generate state parameter
   - Return authorization URL

2. **oauth2callback_hubspot(request: Request)**
   - Handle OAuth callback
   - Exchange code for access token
   - Store credentials in Redis

3. **get_hubspot_credentials(user_id: str, org_id: str)**
   - Retrieve stored credentials
   - Handle token refresh if needed

4. **get_items_hubspot(credentials: str)**
   - Query HubSpot API endpoints
   - Transform data into IntegrationItem objects
   - Return standardized data format

### Frontend (React/JavaScript)

Required implementations in `frontend/src/integrations/hubspot.js`:

1. **Authorization Flow**
   - Implement connect/disconnect functionality
   - Handle OAuth redirects
   - Manage credentials storage

2. **Data Display**
   - Fetch integration items
   - Transform and display data
   - Match existing integration patterns

## Development Setup

1. **Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

2.**Redis Setup**

```bash
redis-server
```

3.**Frontend Setup**

```bash
cd frontend
npm install
npm start
```

## HubSpot Integration Setup

1. Create a HubSpot Developer Account
2. Create a new app in HubSpot
3. Configure OAuth credentials:
   - Authorization URL: <https://app.hubspot.com/oauth/authorize>
   - Token URL: <https://api.hubapi.com/oauth/v1/token>
   - Redirect URI: <http://localhost:8000/integrations/hubspot/oauth2callback>
   - Required scopes:
     - crm.objects.contacts.read
     - crm.objects.companies.read

4. Add credentials to `.env`:

``` bash
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:8000/integrations/hubspot/oauth2callback
```

## Testing

1. **OAuth Flow Testing**
   - Verify authorization redirect
   - Check token exchange
   - Test credential storage/retrieval

2. **Data Integration Testing**
   - Verify API calls
   - Check data transformation
   - Validate IntegrationItem format

## Submission Guidelines

1. Implement all required functionality
2. Ensure code follows existing patterns
3. Add appropriate error handling
4. Include comments and documentation
5. Test thoroughly with real HubSpot credentials

## Additional Resources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs)

## Prerequisites

- Docker and Docker Compose installed on your machine
- OAuth2 credentials for the services you want to integrate:
  - HubSpot
  - Notion
  - Airtable

## Getting Started

### Configuration

1. Copy the example environment file to the root directory:

```bash
cp backend/.env.example .env
```

2.Edit the `.env` file with your OAuth2 credentials:

``` bash
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# HubSpot
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:8000/integrations/hubspot/oauth2callback

# Airtable
AIRTABLE_CLIENT_ID=your_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:8000/integrations/airtable/oauth2callback
AIRTABLE_SCOPE=data.records:read data.records:write data.recordComments:read data.recordComments:write schema.bases:read schema.bases:write

# Notion
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:8000/integrations/notion/oauth2callback

# Cache Settings
CACHE_EXPIRY=600

# API Base URL for Frontend
API_BASE_URL=http://localhost:8000
```

> **Note:** For development purposes, the application will use demo placeholder values if environment variables are not set. However, these will not work for actual integrations.

### Running with Docker Compose

1. Start the entire application stack:

```bash
docker-compose up --build
```

2.Access the applications:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>

3.To stop the application:

```bash
docker-compose down
```

4.To run in detached mode (background):

```bash
docker-compose up -d
```

### Quick Start with Deploy Script

For convenience, you can use the provided deploy script:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:

1. Check if a `.env` file exists and create one if needed
2. Validate environment variables
3. Build and start the Docker containers
4. Display service health status

### Development Mode

If you want to run the application in development mode with live code reloading:

```bash
# For backend development (with Docker)
cd backend
docker-compose up --build

# For backend development (without Docker)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# For frontend development
cd frontend
npm install
npm start
```

## Using the Application

1. Once the application is running, open <http://localhost:3000> in your browser.
2. Use the integration dashboard to connect your accounts:
   - Choose an integration type (HubSpot, Notion, or Airtable)
   - Click "Connect" and follow the OAuth2 flow
   - Once connected, you can view and interact with your data

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| REDIS_HOST | Redis server hostname | Yes | redis |
| REDIS_PORT | Redis server port | Yes | 6379 |
| REDIS_DB | Redis database number | Yes | 0 |
| HUBSPOT_CLIENT_ID | OAuth client ID for HubSpot | Yes | - |
| HUBSPOT_CLIENT_SECRET | OAuth client secret for HubSpot | Yes | - |
| HUBSPOT_REDIRECT_URI | OAuth callback URL for HubSpot | Yes | <http://localhost:8000/>... |
| AIRTABLE_CLIENT_ID | OAuth client ID for Airtable | Yes | - |
| AIRTABLE_CLIENT_SECRET | OAuth client secret for Airtable | Yes | - |
| AIRTABLE_REDIRECT_URI | OAuth callback URL for Airtable | Yes | <http://localhost:8000/>... |
| AIRTABLE_SCOPE | OAuth scope for Airtable | Yes | data.records:read... |
| NOTION_CLIENT_ID | OAuth client ID for Notion | Yes | - |
| NOTION_CLIENT_SECRET | OAuth client secret for Notion | Yes | - |
| NOTION_REDIRECT_URI | OAuth callback URL for Notion | Yes | <http://localhost:8000/>... |
| CACHE_EXPIRY | Redis cache expiration time (seconds) | Yes | 600 |
| API_BASE_URL | Base URL for the backend API | Yes | <http://localhost:8000> |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_BASE_URL | URL of the backend API | <http://localhost:8000> |

## Error Handling

The application includes comprehensive error handling:

1. OAuth Flow Errors
   - Invalid state parameter detection
   - Token exchange failures
   - API rate limiting
   - Network timeouts

2. Data Integration Errors
   - Invalid credentials
   - Permission issues
   - Malformed responses
   - Connection failures

3. Redis Errors
   - Connection failures
   - Cache misses
   - Storage errors

## Security Notes

1. All sensitive data is encrypted at rest
2. OAuth state validation prevents CSRF attacks
3. Rate limiting is implemented for all endpoints
4. Input validation on all API endpoints

## Troubleshooting

- If the frontend can't connect to the backend, check that the backend is running and the REACT_APP_API_BASE_URL environment variable is set correctly.
- If OAuth authentication fails, verify your client IDs and secrets in the .env file.
- For Redis connection issues, ensure the Redis container is running with `docker ps`.

## Docker Commands

### View running containers

```bash
docker ps
```

### View container logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Shell into containers

```bash
docker-compose exec backend bash
docker-compose exec redis redis-cli
```

## VectorShift Integration Assessment Submission ✅

## Implementation Overview

### Part 1: HubSpot OAuth Integration ✅

Successfully implemented the HubSpot OAuth flow including:

1. Backend Implementation (`/backend/integrations/hubspot.py`): ✅
   - Completed OAuth flow with state parameter and token exchange
   - Implemented credential storage and refresh handling
   - Added security features and rate limiting

2. Frontend Implementation (`/frontend/src/integrations/hubspot.js`): ✅
   - Implemented OAuth UI and flow management
   - Added data display components
   - Included error handling and loading states

### Part 2: HubSpot Data Integration ✅

Implemented complete data integration with:

- API endpoints for contacts and companies
- Data transformation to IntegrationItem format
- Caching and performance optimizations
- Error handling and retries

## Testing Completed ✅

- ✅ OAuth Flow (authorization, token exchange, storage)
- ✅ Data Integration (API calls, transformations, display)
- ✅ Error Handling (rate limits, network issues, validation)
- ✅ Security Features (state validation, encryption)

## Running the Solution

1. Configure environment:

```bash
cp backend/.env.example .env
# Add credentials to .env file
```

2.Start services:

```bash
# Backend
cd backend && python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Redis
redis-server

# Frontend
cd frontend && npm install && npm start
```

## Key Features

- OAuth2 implementation with state validation
- Rate limiting and request signing
- Data caching and transformation
- Error handling and retries
- Input validation and sanitization
- Comprehensive security measures

## Future Improvements

1. Add pagination for large datasets
2. Implement webhook support
3. Enhance monitoring and metrics
4. Add automated testing
5. Implement circuit breakers

For detailed setup instructions and API documentation, see:

- `/backend/README.md`: Backend setup and API details
- `/frontend/README.md`: Frontend development guide
