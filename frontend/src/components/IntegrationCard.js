import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const IntegrationCard = ({ title, icon, children }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);

  return (
    <Card sx={{ 
      mt: 2, 
      mb: 2,
      overflow: 'visible',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        transform: 'translateY(-2px)',
      }
    }} className="scale-in">
      <CardContent sx={{ p: 0 }}>
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none',
            borderRadius: expanded ? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0` : theme.shape.borderRadius,
            backgroundColor: theme.palette.grey[50]
          }}
        >
          <Box display="flex" alignItems="center">
            {icon && (
              <Box 
                sx={{ 
                  mr: 1.5, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}
              >
                {icon}
              </Box>
            )}
            <Typography variant="h6" component="div" color="text.primary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <IconButton 
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out'
            }}
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            {children}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
