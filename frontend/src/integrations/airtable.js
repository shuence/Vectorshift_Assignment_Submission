// airtable.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { IntegrationManager } from '../utils/IntegrationManager';
import { INTEGRATION_ENDPOINTS } from '../api/apiEndpoints';

export const AirtableIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(INTEGRATION_ENDPOINTS.AIRTABLE.AUTHORIZE, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'Airtable Authorization', 'width=600, height=600');

            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) { 
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(INTEGRATION_ENDPOINTS.AIRTABLE.CREDENTIALS, formData);
            const credentials = response.data; 
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                IntegrationManager.updateIntegration('Airtable', credentials);
                setIntegrationParams({ credentials: credentials, type: 'Airtable' });
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    useEffect(() => {
        const isAirtableConnected = IntegrationManager.isIntegrationConnected('Airtable');
        setIsConnected(isAirtableConnected);
    }, [integrationParams?.credentials]);

    return (
        <>
        <Box sx={{mt: 2}}>
            Parameters
            <Box display='flex' alignItems='center' justifyContent='center' sx={{mt: 2}}>
                <Button 
                    variant='contained' 
                    onClick={isConnected ? () => {} :handleConnectClick}
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting}
                    style={{
                        pointerEvents: isConnected ? 'none' : 'auto',
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 1 : undefined
                    }}
                >
                    {isConnected ? 'Airtable Connected' : isConnecting ? <CircularProgress size={20} /> : 'Connect to Airtable'}
                </Button>
            </Box>
        </Box>
      </>
    );
}
