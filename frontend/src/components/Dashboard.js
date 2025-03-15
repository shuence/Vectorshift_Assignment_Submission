import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  useTheme,
  IconButton,
  Hidden,
  Typography
} from "@mui/material";
import {
  Menu as MenuIcon,
  Hub as HubSpotIcon,
  Notes as NotionIcon,
  TableChart as AirtableIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { HubspotDashboard } from "../pages/HubspotDashboard";
import { NotionDashboard } from "../pages/NotionDashboard";
import { AirtableDashboard } from "../pages/AirtableDashboard";
import { DashboardOverview } from "../pages/DashboardOverview";
import { IntegrationForm } from "../integration-form";

const drawerWidth = 240;

export const Dashboard = ({ integrations, onLogout }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add debug effect to log integration status
  useEffect(() => {
    const storedParams = localStorage.getItem('integrationParams');
    if (storedParams) {
      try {
        const params = JSON.parse(storedParams);
        console.log("Current integration:", params.type);
        console.log("Credentials exist:", !!params.credentials);
      } catch (e) {
        console.error("Error parsing integration params:", e);
      }
    } else {
      console.log("No integration params found");
    }
  }, []);

  // Add an effect to update tab when integrations change
  useEffect(() => {
    // If current tab is not valid with current integrations, reset to dashboard
    if ((activeTab === "hubspot" && !integrations.hubspot) ||
        (activeTab === "notion" && !integrations.notion) ||
        (activeTab === "airtable" && !integrations.airtable)) {
      setActiveTab("dashboard");
    }
  }, [integrations, activeTab]);

  // When someone successfully connects a new integration
  const handleNewIntegrationSuccess = (type) => {
    console.log(`New integration connected: ${type}`);
    // Don't navigate away - stay on integrations page to allow connecting more services
  };

  // When "Connect New" is clicked, reset any existing form state
  const handleConnectNewClick = () => {
    // Clear any existing form state from localStorage
    localStorage.removeItem("currType");
    
    console.log("Connect New clicked");
    setActiveTab("integrations");
    setMobileOpen(false);
  };

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "hubspot":
        return <HubspotDashboard />;
      case "notion":
        return <NotionDashboard />;
      case "airtable":
        return <AirtableDashboard />;
      case "integrations":
        // When "Connect New" is clicked, show the integration form
        return (
          <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>Connect New Integration</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Select an integration type and connect to your account.
              You can connect multiple services to enhance your dashboard.
            </Typography>
            <IntegrationForm 
              // Use our new handler that doesn't redirect
              onIntegrationSuccess={handleNewIntegrationSuccess}
            />
          </Box>
        );
      default:
        return <DashboardOverview />;
    }
  };

  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <ListItemText 
          primary="INTEGRATIONS"
          primaryTypographyProps={{
            variant: "overline",
            color: "text.secondary",
            fontWeight: "medium"
          }}
        />
      </Box>
      <List>
        {integrations.hubspot && (
          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === "hubspot"}
              onClick={() => {
                setActiveTab("hubspot");
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>
                <HubSpotIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="HubSpot" />
            </ListItemButton>
          </ListItem>
        )}
        
        {integrations.notion && (
          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === "notion"}
              onClick={() => {
                setActiveTab("notion");
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>
                <NotionIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Notion" />
            </ListItemButton>
          </ListItem>
        )}
        
        {integrations.airtable && (
          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === "airtable"}
              onClick={() => {
                setActiveTab("airtable");
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>
                <AirtableIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Airtable" />
            </ListItemButton>
          </ListItem>
        )}
        
        {/* Connect New button - ensure it's properly clickable and clears state */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleConnectNewClick}
            selected={activeTab === "integrations"}
            sx={{ 
              mx: 1,
              my: 0.5,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light + '20',
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Connect New" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      {/* Mobile drawer toggle button */}
      <Hidden smUp>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1300 }}
        >
          <MenuIcon />
        </IconButton>
      </Hidden>

      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};
