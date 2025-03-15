import React, { useState, useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { HomePage } from "./pages/HomePage";
import theme from "./theme";
import { IntegrationManager } from "./utils/IntegrationManager";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [integrations, setIntegrations] = useState({
    hubspot: false,
    notion: false,
    airtable: false,
  });

  useEffect(() => {
    checkConnectedIntegrations();
  }, []);

  const checkConnectedIntegrations = () => {
    const isHubspotConnected = IntegrationManager.isIntegrationConnected('HubSpot');
    const isNotionConnected = IntegrationManager.isIntegrationConnected('Notion');
    const isAirtableConnected = IntegrationManager.isIntegrationConnected('Airtable');
    
    console.log("Connection status:", {
      HubSpot: isHubspotConnected,
      Notion: isNotionConnected, 
      Airtable: isAirtableConnected
    });
    
    setIntegrations({
      hubspot: isHubspotConnected,
      notion: isNotionConnected,
      airtable: isAirtableConnected
    });
    
    const anyConnected = isHubspotConnected || isNotionConnected || isAirtableConnected;
    setIsAuthenticated(anyConnected);
  };

  const handleIntegrationSuccess = (type) => {
    console.log(`App received integration success: ${type}`);
    const normalizedType = type.toLowerCase();
    setIntegrations(prev => ({ ...prev, [normalizedType]: true }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("integrationParams");
    setIntegrations({ hubspot: false, notion: false, airtable: false });
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const checkInterval = setInterval(checkConnectedIntegrations, 2000);
      return () => clearInterval(checkInterval);
    }
  }, [isAuthenticated]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        
        {isAuthenticated ? (
          <Dashboard 
            integrations={integrations} 
            onLogout={handleLogout}
          />
        ) : (
          <HomePage onIntegrationSuccess={handleIntegrationSuccess} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
