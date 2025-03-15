import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Autocomplete,
    TextField,
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Button,
    Alert,
    Snackbar
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import TableChartIcon from "@mui/icons-material/TableChart";
import NotesIcon from "@mui/icons-material/Notes";
import HubIcon from "@mui/icons-material/Hub";
import { AirtableIntegration } from "./integrations/airtable";
import { NotionIntegration } from "./integrations/notion";
import { HubSpotIntegration } from "./integrations/hubspot";
import { DataForm } from "./data-form";
import { IntegrationCard } from "./components/IntegrationCard";

const integrationMapping = {
    Notion: NotionIntegration,
    Airtable: AirtableIntegration,
    HubSpot: HubSpotIntegration,
};

const integrationIcons = {
    Notion: <NotesIcon />,
    Airtable: <TableChartIcon />,
    HubSpot: <HubIcon />,
};

export const IntegrationForm = ({ onIntegrationSuccess }) => {
    const [integrationParams, setIntegrationParams] = useState(
        JSON.parse(localStorage.getItem("integrationParams")) || {}
    );
    const [user, setUser] = useState("TestUser");
    const [org, setOrg] = useState("TestOrg");
    const [currType, setCurrType] = useState(localStorage.getItem("currType") || null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const [processedSuccessTypes, setProcessedSuccessTypes] = useState(new Set());
    
    const [allIntegrations, setAllIntegrations] = useState(
        JSON.parse(localStorage.getItem("allIntegrations")) || {}
    );
    
    useEffect(() => {
        if (Object.keys(allIntegrations).length > 0) {
            localStorage.setItem("allIntegrations", JSON.stringify(allIntegrations));
        }
    }, [allIntegrations]);
    
    useEffect(() => {
        setAlertMessage('');
        setSnackbarOpen(false);
    }, [currType]);
    
    const addNewIntegration = useCallback((type, credentials) => {
        const shouldNotify = !processedSuccessTypes.has(type);
        
        const newIntegration = {
            type,
            credentials
        };
        
        localStorage.setItem("integrationParams", JSON.stringify(newIntegration));
        
        setAllIntegrations(prev => ({
            ...prev,
            [type]: newIntegration
        }));
        
        if (shouldNotify) {
            setAlertMessage(`Successfully connected to ${type}!`);
            setAlertSeverity('success');
            setSnackbarOpen(true);
            
            setProcessedSuccessTypes(prev => new Set(prev).add(type));
            
            if (onIntegrationSuccess) {
                setTimeout(() => {
                    onIntegrationSuccess(type);
                }, 1000);
            }
        }
    }, [onIntegrationSuccess, processedSuccessTypes]);

    const CurrIntegration = integrationMapping[currType] || null;

    useEffect(() => {
        localStorage.setItem("integrationParams", JSON.stringify(integrationParams));
    }, [integrationParams]);

    useEffect(() => {
        localStorage.setItem("user", user);
    }, [user]);

    useEffect(() => {
        localStorage.setItem("org", org);
    }, [org]);

    useEffect(() => {
        localStorage.setItem("currType", currType);
    }, [currType]);

    useEffect(() => {
        if (currType) {
            const existingParams = localStorage.getItem('integrationParams');
            if (existingParams) {
                try {
                    const params = JSON.parse(existingParams);
                    if (params.type === currType && params.credentials) {
                        setAlertMessage(`You already have a ${currType} integration connected. Connecting a new one will replace it.`);
                        setAlertSeverity('warning');
                        setSnackbarOpen(true);
                    }
                } catch (e) {
                    console.error("Error parsing integration params:", e);
                }
            }
        }
    }, [currType]);

    useEffect(() => {
        if (integrationParams?.credentials && integrationParams?.type) {
            addNewIntegration(integrationParams.type, integrationParams.credentials);
        }
    }, [addNewIntegration, integrationParams]);

    const handleClearStorage = () => {
        if (integrationParams?.type) {
            const updatedIntegrations = { ...allIntegrations };
            delete updatedIntegrations[integrationParams.type];
            setAllIntegrations(updatedIntegrations);
            
            if (Object.keys(updatedIntegrations).length > 0) {
                localStorage.setItem("allIntegrations", JSON.stringify(updatedIntegrations));
            } else {
                localStorage.removeItem("allIntegrations");
            }
        }
        
        localStorage.removeItem("integrationParams");
        setIntegrationParams({});
        setCurrType(null);
        
        setAlertMessage('Integration disconnected successfully');
        setAlertSeverity('info');
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        return () => {
            setProcessedSuccessTypes(new Set());
        };
    }, [user, org]);

    return (
        <Box className="fade-in">
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={alertSeverity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
            
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        User Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-end" sx={{ mb: 1 }}>
                                <AccountCircleIcon sx={{ mr: 1, my: 0.5 }} />
                                <TextField
                                    label="User ID"
                                    variant="outlined"
                                    fullWidth
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-end" sx={{ mb: 1 }}>
                                <BusinessIcon sx={{ mr: 1, my: 0.5 }} />
                                <TextField
                                    label="Organization ID"
                                    variant="outlined"
                                    fullWidth
                                    value={org}
                                    onChange={(e) => setOrg(e.target.value)}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <Box mt={3}>
                        <Box display="flex" alignItems="flex-end" sx={{ mb: 1 }}>
                            <IntegrationInstructionsIcon sx={{ mr: 1, my: 0.5 }} />
                            <Autocomplete
                                id="integration-type"
                                options={Object.keys(integrationMapping)}
                                fullWidth
                                renderInput={(params) => <TextField {...params} label="Integration Type" />}
                                onChange={(e, value) => setCurrType(value)}
                                value={currType}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ display: "flex", alignItems: "center" }}>
                                        {integrationIcons[option]}
                                        <Box sx={{ ml: 2 }}>{option}</Box>
                                    </Box>
                                )}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {currType && CurrIntegration && (
                <IntegrationCard title={`${currType} Integration`} icon={integrationIcons[currType]}>
                    <CurrIntegration
                        user={user}
                        org={org}
                        integrationParams={integrationParams}
                        setIntegrationParams={setIntegrationParams}
                    />
                </IntegrationCard>
            )}

            {integrationParams?.credentials && integrationParams?.type && (
                <IntegrationCard title="Connected Data" icon={<IntegrationInstructionsIcon />}>
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label={`Connected to ${integrationParams.type}`}
                            color="success"
                            variant="filled"
                            size="small"
                        />
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleClearStorage}
                            sx={{ ml: 2 }}
                        >
                            Disconnect
                        </Button>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <DataForm
                        integrationType={integrationParams.type}
                        credentials={integrationParams.credentials}
                    />
                </IntegrationCard>
            )}
        </Box>
    );
};
