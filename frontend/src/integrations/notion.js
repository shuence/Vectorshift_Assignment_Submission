// notion.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { IntegrationManager } from '../utils/IntegrationManager';
import { INTEGRATION_ENDPOINTS } from '../api/apiEndpoints';

export const NotionIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(INTEGRATION_ENDPOINTS.NOTION.AUTHORIZE, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'Notion Authorization', 'width=600, height=600');

            // Polling for the window to close
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

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(INTEGRATION_ENDPOINTS.NOTION.CREDENTIALS, formData);
            const credentials = response.data; 
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                // Use IntegrationManager to save specifically as Notion
                IntegrationManager.updateIntegration('Notion', credentials);
                // Update local state
                setIntegrationParams({ credentials: credentials, type: 'Notion' });
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    useEffect(() => {
        // Check specifically for Notion connection
        const isNotionConnected = IntegrationManager.isIntegrationConnected('Notion');
        setIsConnected(isNotionConnected);
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
                    {isConnected ? 'Notion Connected' : isConnecting ? <CircularProgress size={20} /> : 'Connect to Notion'}
                </Button>
            </Box>
        </Box>
      </>
    );
}
