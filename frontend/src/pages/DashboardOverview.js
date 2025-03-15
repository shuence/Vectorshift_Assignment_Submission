import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import NotesIcon from '@mui/icons-material/Notes';
import TableChartIcon from '@mui/icons-material/TableChart';
import { IntegrationManager } from '../utils/IntegrationManager';

export const DashboardOverview = () => {
  // Check each integration service independently
  const isHubspotActive = IntegrationManager.isIntegrationConnected('HubSpot');
  const isNotionActive = IntegrationManager.isIntegrationConnected('Notion');
  const isAirtableActive = IntegrationManager.isIntegrationConnected('Airtable');
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome to your Integration Dashboard</Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        Manage and access all your connected services from one place. 
        Choose an integration from the sidebar to view your data, or connect a new integration.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <IntegrationStatusCard 
            title="HubSpot"
            icon={<HubIcon sx={{ fontSize: 40 }} />}
            isActive={isHubspotActive}
            description="Access contacts, companies, and deals from your HubSpot account."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <IntegrationStatusCard 
            title="Notion"
            icon={<NotesIcon sx={{ fontSize: 40 }} />}
            isActive={isNotionActive}
            description="Browse and manage your Notion databases and pages."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <IntegrationStatusCard 
            title="Airtable"
            icon={<TableChartIcon sx={{ fontSize: 40 }} />}
            isActive={isAirtableActive}
            description="Access your Airtable bases, tables, and records."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper component to display integration status
const IntegrationStatusCard = ({ title, icon, isActive, description }) => (
  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ color: isActive ? 'primary.main' : 'text.disabled', mr: 1 }}>
                    {icon}
                </Box>
                <Typography variant="h6">{title}</Typography>
            </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                  sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: isActive ? 'success.main' : 'text.disabled',
                      mr: 1,
                  }}
              />
              <Typography variant="body2" color={isActive ? 'success.main' : 'text.secondary'}>
                  {isActive ? 'Connected' : 'Not Connected'}
              </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
              {description}
          </Typography>
      </CardContent>
      <CardActions>
          {isActive ? (
              <Button size="small" color="primary">View Dashboard</Button>
          ) : (
              <Button size="small" disabled>Not Connected</Button>
          )}
      </CardActions>
  </Card>
);
