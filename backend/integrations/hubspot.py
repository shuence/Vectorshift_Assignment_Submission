import json
import secrets
import os
from typing import Dict, List, Optional, Any
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import base64
from dotenv import load_dotenv
from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

# Load environment variables
load_dotenv()

# Get configuration from environment variables
CLIENT_ID = os.getenv('HUBSPOT_CLIENT_ID')
CLIENT_SECRET = os.getenv('HUBSPOT_CLIENT_SECRET')
REDIRECT_URI = os.getenv('HUBSPOT_REDIRECT_URI')
CACHE_EXPIRY = int(os.getenv('CACHE_EXPIRY', 600))

# API constants
HUBSPOT_AUTH_URL = 'https://app-na2.hubspot.com/oauth/authorize'
HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token'
HUBSPOT_API_BASE = 'https://api.hubapi.com/crm/v3/objects'
HUBSPOT_SCOPES = 'crm.objects.contacts.write oauth crm.objects.companies.write crm.objects.companies.read crm.objects.contacts.read'

# Cache constants
TOKEN_PREFIX = 'hubspot_credentials:'
STATE_PREFIX = 'hubspot_state:'

# Create a shared HTTP client with connection pooling
http_client = httpx.AsyncClient(
    timeout=30.0,
    limits=httpx.Limits(max_keepalive_connections=10, max_connections=20)
)

def get_redis_key(prefix: str, org_id: str, user_id: str) -> str:
    """Generate consistent Redis keys"""
    return f"{prefix}{org_id}:{user_id}"

async def authorize_hubspot(user_id: str, org_id: str) -> str:
    """
    Create an authorization URL for HubSpot OAuth flow
    """
    # Generate a secure state token
    state_token = secrets.token_urlsafe(32)
    
    # Create state data with user context
    state_data = {
        'state': state_token,
        'user_id': user_id,
        'org_id': org_id
    }
    
    # URL safe encode the state
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode('utf-8')).decode('utf-8')
    
    # Store state in Redis for verification
    state_key = get_redis_key(STATE_PREFIX, org_id, user_id)
    await add_key_value_redis(state_key, json.dumps(state_data), expire=CACHE_EXPIRY)
    
    # Build and return the authorization URL
    auth_params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope': HUBSPOT_SCOPES,
        'state': encoded_state
    }
    
    query_string = '&'.join([f"{k}={v}" for k, v in auth_params.items()])
    return f"{HUBSPOT_AUTH_URL}?{query_string}"

async def oauth2callback_hubspot(request: Request) -> HTMLResponse:
    """
    Handle the OAuth 2.0 callback from HubSpot
    """
    # Check for errors in the callback
    if request.query_params.get('error'):
        raise HTTPException(
            status_code=400, 
            detail=request.query_params.get('error_description', 'OAuth error')
        )
    
    # Extract code and state from the request
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    
    if not code:
        raise HTTPException(status_code=400, detail='No authorization code provided')
    
    # Decode and verify the state
    try:
        state_data = json.loads(base64.urlsafe_b64decode(encoded_state).decode('utf-8'))
        original_state = state_data.get('state')
        user_id = state_data.get('user_id')
        org_id = state_data.get('org_id')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid state parameter: {str(e)}')
    
    # Retrieve saved state from Redis
    state_key = get_redis_key(STATE_PREFIX, org_id, user_id)
    saved_state = await get_value_redis(state_key)
    
    # Verify state matches
    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State validation failed')
    
    # Exchange code for access token
    try:
        token_response = await http_client.post(
            HUBSPOT_TOKEN_URL,
            data={
                'grant_type': 'authorization_code',
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'redirect_uri': REDIRECT_URI,
                'code': code
            },
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        )
        
        token_response.raise_for_status()
        token_data = token_response.json()
        
        # Clean up the state from Redis
        await delete_key_redis(state_key)
        
        # Store credentials in Redis with proper expiry
        expiry_time = token_data.get('expires_in', CACHE_EXPIRY)
        token_key = get_redis_key(TOKEN_PREFIX, org_id, user_id)
        
        await add_key_value_redis(token_key, json.dumps(token_data), expire=expiry_time)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, 
            detail=f"HubSpot API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve HubSpot access token: {str(e)}"
        )
    
    # Return a script to close the window
    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)

async def get_hubspot_credentials(user_id: str, org_id: str) -> Dict[str, Any]:
    """
    Retrieve HubSpot credentials from Redis
    """
    try:
        token_key = get_redis_key(TOKEN_PREFIX, org_id, user_id)
        credentials = await get_value_redis(token_key)
        
        if not credentials:
            raise HTTPException(status_code=400, detail='No credentials found')
        
        return json.loads(credentials)
    except json.JSONDecodeError:
        # Clean up invalid credentials
        token_key = get_redis_key(TOKEN_PREFIX, org_id, user_id)
        await delete_key_redis(token_key)
        raise HTTPException(status_code=400, detail='Invalid credentials format')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving credentials: {str(e)}")

def create_integration_item_metadata_object(
    response_json: Dict[str, Any], 
    item_type: str, 
    parent_id: Optional[str] = None
) -> IntegrationItem:
    """
    Create an IntegrationItem from HubSpot object data
    """
    item_id = response_json.get('id', '')
    properties = response_json.get('properties', {})
    
    # Extract name based on the object type
    name = None
    if item_type == 'Contact':
        first_name = properties.get('firstname', '')
        last_name = properties.get('lastname', '')
        name = f"{first_name} {last_name}".strip() or f"Contact {item_id}"
    elif item_type == 'Company':
        name = properties.get('name', f"Company {item_id}")
    elif item_type == 'Deal':
        name = properties.get('dealname', f"Deal {item_id}")
    
    # Get timestamps
    created_timestamp = properties.get('createdate', None)
    updated_timestamp = properties.get('hs_lastmodifieddate', None)
    
    return IntegrationItem(
        id=item_id,
        type=item_type,
        name=name,
        parent_id=parent_id,
        creation_time=created_timestamp,
        last_modified_time=updated_timestamp,
        url=f"https://app.hubspot.com/{item_type.lower()}s/{item_id}"
    )

async def fetch_hubspot_items(
    endpoint: str, 
    access_token: str, 
    item_type: str
) -> List[IntegrationItem]:
    """Helper function to fetch items from HubSpot API"""
    try:
        response = await http_client.get(
            f"{HUBSPOT_API_BASE}/{endpoint}",
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
            },
            params={'limit': 20}  # Increased for better data sampling
        )
        
        response.raise_for_status()
        data = response.json()
        
        return [
            create_integration_item_metadata_object(item, item_type)
            for item in data.get('results', [])
        ]
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            # Token expired - this is handled by the caller
            raise
        print(f"Error fetching {endpoint}: {str(e)}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching {endpoint}: {str(e)}")
        return []

async def get_items_hubspot(credentials: str) -> List[IntegrationItem]:
    """
    Retrieve contacts, companies, and deals from HubSpot
    """
    try:
        # Parse the credentials
        credentials_data = json.loads(credentials)
        access_token = credentials_data.get('access_token')
        
        if not access_token:
            raise HTTPException(status_code=400, detail='Invalid credentials')
        
        # Fetch data concurrently for better performance
        contacts_task = fetch_hubspot_items('contacts', access_token, 'Contact')
        companies_task = fetch_hubspot_items('companies', access_token, 'Company')
        deals_task = fetch_hubspot_items('deals', access_token, 'Deal')
        
        # Gather all results
        contacts, companies, deals = await asyncio.gather(
            contacts_task, companies_task, deals_task,
            return_exceptions=True
        )
        
        integration_items = []
        
        # Process results, handling any exceptions
        for result, item_type in [(contacts, 'contacts'), (companies, 'companies'), (deals, 'deals')]:
            if isinstance(result, Exception):
                if isinstance(result, httpx.HTTPStatusError) and result.response.status_code == 401:
                    raise HTTPException(status_code=401, detail='HubSpot authorization expired. Please authorize again.')
                print(f"Error fetching {item_type}: {str(result)}")
            else:
                integration_items.extend(result)
        
        return integration_items
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail='Invalid credentials format')
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving items: {str(e)}")