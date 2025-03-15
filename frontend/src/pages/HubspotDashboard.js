import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import AppsIcon from '@mui/icons-material/Apps';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import { IntegrationManager } from '../utils/IntegrationManager';
import { INTEGRATION_ENDPOINTS } from '../api/apiEndpoints';

export const HubspotDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const credentials = IntegrationManager.getIntegrationCredentials('HubSpot');
      if (!credentials) {
        setErrorMessage('No HubSpot credentials found');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));

      const response = await axios.post(
        INTEGRATION_ENDPOINTS.HUBSPOT.GET_ITEMS,
        formData
      );

      setAllItems(response.data || []);
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to fetch HubSpot data:', error);
      setErrorMessage(error?.response?.data?.detail || 'Failed to fetch HubSpot data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!dataLoaded) {
      fetchData();
    }
  }, [dataLoaded, fetchData]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleViewModeChange = useCallback((event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  }, []);

  const showJsonDialog = useCallback((item) => {
    setSelectedItem(item);
    setJsonDialogOpen(true);
  }, []);

  const handleCopyJson = useCallback(() => {
    if (selectedItem) {
      navigator.clipboard.writeText(JSON.stringify(selectedItem, null, 2))
        .then(() => {
          setErrorMessage('JSON copied to clipboard!');
          setSnackbarOpen(true);
        })
        .catch(() => {
          setErrorMessage('Failed to copy JSON');
          setSnackbarOpen(true);
        });
    }
  }, [selectedItem]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const currentData = useMemo(() => {
    switch (tabValue) {
      case 0:
        return allItems.filter(item => item.type === 'Contact');
      case 1:
        return allItems.filter(item => item.type === 'Company');
      case 2:
        return allItems.filter(item => item.type === 'Deal');
      default:
        return [];
    }
  }, [tabValue, allItems]);

  const renderTabContent = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!currentData.length) {
      return (
        <Box sx={{ textAlign: 'left', mt: 4, p: 4, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            No data found. Try refreshing or check your connection.
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchData} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Box>
      );
    }

    return viewMode === 'grid' ? (
      <Grid container spacing={3}>
        {currentData.map((item, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                {Object.entries(item).map(([key, value]) => (
                  <Typography key={key} variant="body2" color="text.secondary">
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ))}
                <Button startIcon={<CodeIcon />} size="small" onClick={() => showJsonDialog(item)} sx={{ mt: 1 }}>
                  View JSON
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {Object.keys(currentData[0]).map(key => (
                <TableCell key={key} sx={{ fontWeight: 'bold' }}>
                  {key.toUpperCase()}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((item, index) => (
              <TableRow key={index}>
                {Object.entries(item).map(([key, value]) => (
                  <TableCell key={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </TableCell>
                ))}
                <TableCell>
                  <Button startIcon={<CodeIcon />} size="small" onClick={() => showJsonDialog(item)}>
                    JSON
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [loading, currentData, viewMode, fetchData, showJsonDialog]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="h4" gutterBottom>HubSpot Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your HubSpot data from one place
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="hubspot data tabs">
            <Tab label="Contacts" />
            <Tab label="Companies" />
            <Tab label="Deals" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Tooltip title="Refresh data">
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              variant="outlined"
              size="small"
              disabled={loading}
            >
              Refresh
            </Button>
          </Tooltip>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <AppsIcon />
            </ToggleButton>
            <ToggleButton value="row" aria-label="row view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {renderTabContent}
      </Paper>

      <Dialog open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          JSON Data
          <Tooltip title="Copy JSON">
            <IconButton onClick={handleCopyJson} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontSize: '0.875rem' }}>
            {selectedItem ? JSON.stringify(selectedItem, null, 2) : '{}'}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={errorMessage.includes('copied') ? 'success' : 'error'} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};