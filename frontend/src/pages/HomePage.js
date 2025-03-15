import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { IntegrationForm } from '../integration-form';

export const HomePage = ({ onIntegrationSuccess }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary.main" fontWeight="bold">
          Welcome to Integration Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
          Connect your favorite services to access and manage your data all in one place.
          Start by setting up an integration below.
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: theme => `1px solid ${theme.palette.divider}`,
          mb: 5
        }}
      >
        <IntegrationForm onIntegrationSuccess={onIntegrationSuccess} />
      </Paper>
    </Container>
  );
};
