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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';
import { IntegrationManager } from '../utils/IntegrationManager';
import { INTEGRATION_ENDPOINTS } from '../api/apiEndpoints';

export const NotionDashboard = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [databaseItems, setDatabaseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabaseItems = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get credentials using IntegrationManager
      const credentials = IntegrationManager.getIntegrationCredentials('Notion');
      if (!credentials) {
        console.error('No Notion credentials found');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));
      formData.append('database_id', selectedDatabase);
      
      const response = await axios.post(
        INTEGRATION_ENDPOINTS.NOTION.DATABASE_ITEMS,
        formData
      );
      
      setDatabaseItems(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch Notion database items:', error);
      setLoading(false);
    }
  }, [selectedDatabase]);
  
  useEffect(() => {
    if (selectedDatabase) {
      fetchDatabaseItems();
    }
  }, [fetchDatabaseItems, selectedDatabase]);
  
  const fetchDatabases = async () => {
    try {
      setLoading(true);
      
      // Get credentials using IntegrationManager
      const credentials = IntegrationManager.getIntegrationCredentials('Notion');
      if (!credentials) {
        console.error('No Notion credentials found');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));
      
      const response = await axios.post(
        INTEGRATION_ENDPOINTS.NOTION.DATABASES,
        formData
      );
      
      setDatabases(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch Notion databases:', error);
      setLoading(false);
    }
  };
  
  
  
  const handleDatabaseChange = (event) => {
    setSelectedDatabase(event.target.value);
  };
  
  const showJsonDialog = (item) => {
    setSelectedItem(item);
    setJsonDialogOpen(true);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Notion Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Access your Notion databases and pages
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel>Select Database</InputLabel>
          <Select
            value={selectedDatabase}
            onChange={handleDatabaseChange}
            label="Select Database"
            disabled={loading}
          >
            {databases.map((db) => (
              <MenuItem key={db.id} value={db.id}>{db.title || `Database ${db.id.slice(0, 8)}`}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedDatabase && databaseItems.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Edited</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {databaseItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id.slice(0, 8)}...</TableCell>
                    <TableCell>{item.title || 'Untitled'}</TableCell>
                    <TableCell>{new Date(item.created_time).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(item.last_edited_time).toLocaleDateString()}</TableCell>
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
        ) : selectedDatabase ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No items found in this database.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Select a database to view its contents.
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>JSON Data</DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ 
            overflow: 'auto', 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            fontSize: '0.875rem'
          }}>
            {selectedItem ? JSON.stringify(selectedItem, null, 2) : '{}'}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
