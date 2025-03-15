import { 
  AppBar,
  Toolbar,
  Typography,
  Box,
  useTheme,
  Button
} from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import LogoutIcon from '@mui/icons-material/Logout';

export const Header = ({ isAuthenticated, onLogout }) => {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <ApiIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Integration Dashboard
          </Typography>
        </Box>

        {isAuthenticated && (
          <Button 
            color="inherit" 
            onClick={onLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
