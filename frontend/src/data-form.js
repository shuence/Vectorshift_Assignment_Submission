import { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Alert,
    Collapse,
} from '@mui/material';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { INTEGRATION_ENDPOINTS, BASE_URL } from './api/apiEndpoints';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot',
};

export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Ensure we have a valid endpoint for the API call
    const endpoint = endpointMapping[integrationType] || integrationType.toLowerCase();

    const handleLoad = async () => {
        if (!endpoint) {
            setError(`Unsupported integration type: ${integrationType}`);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Prepare credentials data
            let credentialsData = credentials;
            if (typeof credentials === 'string') {
                try {
                    // Try to parse if it's a stringified JSON
                    credentialsData = JSON.parse(credentials);
                } catch (e) {
                    console.error("Error parsing credentials:", e);
                    // Keep original if parsing fails
                }
            }

            // Create form data for the request
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentialsData));

            // Construct the API endpoint - use the appropriate endpoint based on integration type
            const url = integrationType === 'HubSpot' ? 
                INTEGRATION_ENDPOINTS.HUBSPOT.GET_ITEMS : 
                `${BASE_URL}/integrations/${endpoint}/load`;

            const response = await axios.post(url, formData);
            setLoadedData(response.data);
        } catch (e) {
            console.error("API Error:", e);
            setError(e?.response?.data?.detail || `Error loading ${integrationType} data`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box mb={2}>
                        <Typography variant="body1" gutterBottom>
                            Connected to {integrationType}. Load your data below.
                        </Typography>
                    </Box>

                    <Collapse in={!!error}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    </Collapse>
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLoad}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Loading...' : 'Load Data'}
                        </Button>

                        {loadedData && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setLoadedData(null)}
                                startIcon={<DeleteSweepIcon />}
                                sx={{ mb: 2 }}
                            >
                                Clear Data
                            </Button>
                        )}
                    </Box>

                    <Paper 
                        elevation={1} 
                        sx={{ 
                            p: 2, 
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            minHeight: 150,
                            maxHeight: 400,
                            overflow: 'auto'
                        }}
                    >
                        {loadedData ? (
                            <Box component="pre" sx={{ 
                                m: 0, 
                                fontFamily: '"Roboto Mono", monospace',
                                fontSize: '0.85rem',
                                color: '#334155',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {JSON.stringify(loadedData, null, 2)}
                            </Box>
                        ) : (
                            <Box 
                                display="flex" 
                                justifyContent="center" 
                                alignItems="center" 
                                height="100%"
                                color="text.secondary"
                            >
                                <Typography>No data loaded yet</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};