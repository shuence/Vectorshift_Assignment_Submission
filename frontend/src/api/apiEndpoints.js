// Base routes
export const API_ROUTES = {
  BASE: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  INTEGRATIONS: '/integrations'
};

// Full base URL for API calls
export const BASE_URL = API_ROUTES.BASE;

// Integration endpoints
export const INTEGRATION_ENDPOINTS = {
    // HubSpot endpoints
    HUBSPOT: {
        AUTHORIZE: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/hubspot/authorize`,
        CREDENTIALS: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/hubspot/credentials`,
        GET_ITEMS: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/hubspot/get_hubspot_items`,
        OAUTH2_CALLBACK: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/hubspot/oauth2callback`
    },
    
    // Notion endpoints
    NOTION: {
        AUTHORIZE: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/authorize`,
        CREDENTIALS: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/credentials`,
        DATABASES: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/databases`,
        DATABASE_ITEMS: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/database_items`,
        LOAD: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/load`,
        OAUTH2_CALLBACK: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/notion/oauth2callback`
    },
    
    // Airtable endpoints
    AIRTABLE: {
        AUTHORIZE: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/airtable/authorize`,
        CREDENTIALS: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/airtable/credentials`,
        LOAD: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/airtable/load`,
        OAUTH2_CALLBACK: `${BASE_URL}${API_ROUTES.INTEGRATIONS}/airtable/oauth2callback`
    }
};
