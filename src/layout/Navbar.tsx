import { useQuery } from "@apollo/client";
import { useNavigate, useLocation } from "react-router-dom";
import { GET_PROJECT } from "../utils/Project/Project";
import { Project } from "../lib/interface";
import { useCallback } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Skeleton,
  useTheme,
  alpha,
  Badge
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import HistoryIcon from "@mui/icons-material/History";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ProjectsData {
  getUserProjects: {
    projects: Project[];
    pageInfo: {
      IND: number;
      TOTALROW: number;
    };
  };
}



const ProjectList = ({
  data,
  loading,
  error,
  onProjectClick,
}: {
  data?: ProjectsData;
  loading: boolean;
  error?: Error;
  onProjectClick: (id: string) => void;
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton animation="wave" height={40} />
        <Skeleton animation="wave" height={40} />
        <Skeleton animation="wave" height={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ErrorOutlineIcon color="error" fontSize="small" />
        <Typography variant="body2" color="error">
          {error.message}
        </Typography>
      </Paper>
    );
  }

  return (
    <List disablePadding sx={{ mt: 1 }}>
      {data?.getUserProjects.projects?.map((item: Project) => (
        <ListItem key={item.idProject} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={() => onProjectClick(item.idProject)}
            sx={{ 
              borderRadius: 2,
              py: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              primaryTypographyProps={{ 
                noWrap: true,
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const { data, loading, error } = useQuery<ProjectsData>(GET_PROJECT, {
    variables: { pageIndex: 1, pageSize: 10, nameProject: "" },
  });

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const handleProjectClick = useCallback(
    (id: string) => {
      navigateTo(`/project/${id}`);
    },
    [navigateTo]
  );

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        width: 280,
        p: 3,
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Text-based Logo */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          mb: 5, 
          mt: 3,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Pixel pattern background */}
          <Box 
            sx={{
              position: 'absolute',
              top: '-5px',
              right: '-20px',
              zIndex: 0,
              opacity: 0.2,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 6px)',
              gridTemplateRows: 'repeat(4, 6px)',
              gap: '3px',
              transform: 'rotate(-10deg)'
            }}
          >
            {Array(16).fill(0).map((_, i) => (
              <Box 
                key={i} 
                sx={{ 
                  width: '6px', 
                  height: '6px', 
                  bgcolor: i % 3 === 0 ? theme.palette.primary.main : 
                          i % 3 === 1 ? theme.palette.secondary.main : 
                          theme.palette.primary.light,
                  borderRadius: '1px'
                }} 
              />
            ))}
          </Box>

          {/* Logo text */}
          <Typography 
            variant="h4" 
            component="div"
            sx={{
              fontWeight: 800,
              fontSize: '1.9rem',
              letterSpacing: '0.5px',
              position: 'relative',
              zIndex: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 2px 4px rgba(0,0,0,0.08)',
              fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif'
            }}
          >
            PIXEL
          </Typography>

          {/* App text with pixelated effect */}
          <Box
            sx={{
              position: 'relative',
              mt: -1,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: theme.palette.text.secondary,
                fontFamily: '"Roboto Mono", monospace',
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                pb: 0.5,
                px: 1
              }}
            >
              App
            </Typography>

            {/* Pixel dot */}
            <Box 
              sx={{ 
                width: '8px', 
                height: '8px', 
                bgcolor: theme.palette.primary.main,
                ml: 0.5,
                borderRadius: '1px' 
              }} 
            />
          </Box>
        </Box>

        {/* Tagline */}
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1.5, 
            color: alpha(theme.palette.text.secondary, 0.7),
            letterSpacing: '0.5px',
            fontSize: '0.7rem',
            textTransform: 'uppercase'
          }}
        >
          Collaborative Design Tool
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.primary.main, 0.03)
        }}
      >
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigateTo("/")}
              selected={isActive("/")}
              sx={{
                borderRadius: 2,
                py: 1.5,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: '3px',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive("/") ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{ 
                  fontWeight: isActive("/") ? 600 : 500
                }}
                sx={{ color: isActive("/") ? theme.palette.primary.main : theme.palette.text.primary }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigateTo("/conversation")}
              selected={isActive("/conversation")}
              sx={{
                borderRadius: 2,
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: '3px',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive("/conversation") ? theme.palette.primary.main : theme.palette.text.secondary }}>
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!isActive("/conversation")}
                >
                  <ChatIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary="Conversation" 
                primaryTypographyProps={{ 
                  fontWeight: isActive("/conversation") ? 600 : 500
                }}
                sx={{ color: isActive("/conversation") ? theme.palette.primary.main : theme.palette.text.primary }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      {/* Recent Projects Section */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 1 }}>
          <HistoryIcon sx={{ fontSize: 18, color: theme.palette.text.secondary, mr: 1 }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: theme.palette.text.secondary
            }}
          >
            Recent Projects
          </Typography>
        </Box>
        
        <ProjectList
          data={data}
          loading={loading}
          error={error}
          onProjectClick={handleProjectClick}
        />
      </Box>
    </Box>
  );
};
