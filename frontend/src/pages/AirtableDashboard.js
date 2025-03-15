import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import { IntegrationManager } from '../utils/IntegrationManager';
import { INTEGRATION_ENDPOINTS } from '../api/apiEndpoints';

export const AirtableDashboard = () => {
  const [airtableData, setAirtableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [baseCategories, setBaseCategories] = useState([]);
  
  // Main function to fetch Airtable data using the available endpoint
  // Duplicate declaration removed

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const fetchAirtableData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get credentials using IntegrationManager
      const credentials = IntegrationManager.getIntegrationCredentials('Airtable');
      if (!credentials) {
        setError('No Airtable credentials found. Please connect your Airtable account first.');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));
      
      const response = await axios.post(
        INTEGRATION_ENDPOINTS.AIRTABLE.LOAD,
        formData
      );
      
      if (response.data) {
        setAirtableData(response.data);
        
        // Extract base categories/types from the data
        if (Array.isArray(response.data)) {
          // Try to identify different types of data to organize into tabs
          const categories = extractCategories(response.data);
          setBaseCategories(categories);
        } else {
          setError('Unexpected data format received.');
        }
      } else {
        setError('No data received from server.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch Airtable data:', error);
      setError(error?.response?.data?.detail || 'Failed to fetch Airtable data. Please try again.');
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchAirtableData();
  }, [fetchAirtableData]);


  // Helper function to extract categories or types from the data
  const extractCategories = (data) => {
    // This is a simple example - adjust based on actual data structure
    if (!Array.isArray(data) || data.length === 0) return ["All Items"];
    
    // Try to find common property to group by
    const sampleItem = data[0];
    
    if (sampleItem.type) {
      // If items have a type field, use that for categories
      const types = [...new Set(data.map(item => item.type))];
      return types.length > 0 ? types : ["All Items"];
    } 
    
    if (sampleItem.id && sampleItem.name) {
      // These might be bases
      return ["Bases"];
    }
    
    return ["All Items"];
  };
  
  // Get the currently filtered data based on selected tab
  const getCurrentData = () => {
    if (!Array.isArray(airtableData) || airtableData.length === 0) return [];
    
    if (baseCategories.length <= 1 || currentTab >= baseCategories.length) {
      return airtableData;
    }
    
    const category = baseCategories[currentTab];
    if (category === "All Items") return airtableData;
    
    // Filter by type if available
    return airtableData.filter(item => item.type === category);
  };

  const showJsonDialog = (item) => {
    setSelectedItem(item);
    setJsonDialogOpen(true);
  };

  const copyToClipboard = () => {
    if (selectedItem) {
      navigator.clipboard.writeText(JSON.stringify(selectedItem, null, 2));
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Helper function to format field values for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) {
      if (value.length === 0) return '(empty array)';
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
    }
    return String(value);
  };

  // Render the data table based on the structure of the items
  const renderDataTable = (items) => {
    if (!items || items.length === 0) return null;
    
    // Get headers from the first item's keys, excluding complex objects
    const sampleItem = items[0];
    const headers = Object.keys(sampleItem).filter(key => {
      const value = sampleItem[key];
      return typeof value !== 'object' || value === null || Array.isArray(value);
    });
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                  {header.charAt(0).toUpperCase() + header.slice(1)}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {headers.map((header, colIndex) => (
                  <TableCell key={colIndex}>
                    {formatValue(item[header])}
                  </TableCell>
                ))}
                <TableCell>
                  <Button 
                    startIcon={<CodeIcon />} 
                    size="small"
                    onClick={() => showJsonDialog(item)}
                  >
                    JSON
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <><Box sx={{ width: '100%' }}></Box><Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>Airtable Dashboard</Typography>
      <Typography variant="body1" color="text.secondary">
        Access your Airtable data
      </Typography>
    </Box><Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Airtable Data</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchAirtableData}
            size="small"
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {baseCategories.length > 1 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                  {baseCategories.map((category, index) => (
                    <Tab key={index} label={category} />
                  ))}
                </Tabs>
              </Box>
            )}

            {airtableData.length > 0 ? (
              renderDataTable(getCurrentData())
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No Airtable data available. Please check your connection or try refreshing.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper><Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Item Data</span>
          <Box>
            {copiedMessage && <Chip label="Copied!" color="success" size="small" sx={{ mr: 1 }} />}
            <Tooltip title="Copy JSON">
              <IconButton onClick={copyToClipboard} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{
            overflow: 'auto',
            bgcolor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            fontSize: '0.875rem',
            maxHeight: '400px'
          }}>
            {selectedItem ? JSON.stringify(selectedItem, null, 2) : '{}'}
          </Box>
        </DialogContent>
      </Dialog></>
  );
};
