import React, { useEffect, useState } from "react";
import { User } from "../../lib/interface";
import {
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  List,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
  Chip,
  Tooltip
} from "@mui/material";
import { CREATE_CONVERSATION } from "../../utils/Conversation/comversation";
import { useLazyQuery, useMutation } from "@apollo/client";
import { SEARCH_USER } from "../../utils/User/User";
import { Avatar } from "../Avatar/Avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';

interface IConversation {
  id: string;
  members: User[];
  lastMessage: string;
}

interface IProp {
  listConversation: IConversation[];
  currentUserId: string; // Add current user ID as a prop
}

export const ConversationList = ({
  listConversation,
  currentUserId,
}: IProp) => {
  const [query, setQuery] = useState("");
  const [createConversation, { loading: creatingConversation }] =
    useMutation(CREATE_CONVERSATION);
  const [searchUser, { loading, data, error }] = useLazyQuery<{
    searchUserByName: User[];
  }>(SEARCH_USER);
  const navigate = useNavigate();
  const [cookies, setCookies] = useCookies(["memberData"]);
  const theme = useTheme();
  const { id: activeConversationId } = useParams<{ id: string }>();
  
  useEffect(() => {
    if (query) {
      searchUser({ variables: { searchText: query } });
    }
  }, [query, searchUser]);

  const handleSearchClick = () => {
    searchUser({ variables: { searchText: query } });
  };

  const conversations = listConversation ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0 }}>
      {/* Search Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Find or start a conversation"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <Button 
                  size="small" 
                  variant="contained" 
                  color="primary"
                  onClick={handleSearchClick}
                  sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  Search
                </Button>
              </InputAdornment>
            ) : null,
            sx: {
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }
          }}
        />
      </Box>

      {/* Status indicators */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
        {/* Loading and error states */}
        {loading && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Typography variant="body2" color="error" sx={{ p: 2 }}>
            Error: {error.message}
          </Typography>
        )}

        {/* Search results */}
        {data && data.searchUserByName.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No users found
            </Typography>
          </Box>
        )}

        {data && data.searchUserByName.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: theme.palette.primary.main }}>
              Search Results
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                backgroundColor: 'transparent',
                mb: 2
              }}
            >
              <List disablePadding>
                {data.searchUserByName.map((user: User) => (
                  <ListItem
                    key={user.idUser}
                    button
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                    onClick={() =>
                      createConversation({ variables: { receiverId: user.idUser } })
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profilePicture ?? ""} name={user.name} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.name}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        variant: "body1"
                      }}
                    />
                    <Tooltip title="Start conversation">
                      <PersonAddIcon sx={{ color: theme.palette.primary.main }} />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Creating conversation indicator */}
        {creatingConversation && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Creating conversation...
            </Typography>
          </Box>
        )}

        {/* Conversations list */}
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 2, 
              py: 1, 
              display: 'flex',
              alignItems: 'center',
              color: theme.palette.primary.main,
              fontWeight: 600 
            }}
          >
            <MessageIcon sx={{ mr: 1, fontSize: 18 }} />
            Your Conversations
            {conversations.length > 0 && (
              <Chip 
                size="small" 
                label={conversations.length} 
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
              />
            )}
          </Typography>
          
          {conversations.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                No conversations yet. Start by searching for a user above.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {conversations.map((conv) => {
                const otherMembers = conv.members.filter(
                  (member) => (member.uuid as string) !== currentUserId
                );
                const isActive = conv.id === activeConversationId;
                
                return (
                  <ListItem
                    key={conv.id}
                    button
                    selected={isActive}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      backgroundColor: isActive 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive 
                          ? alpha(theme.palette.primary.main, 0.15) 
                          : alpha(theme.palette.primary.main, 0.05)
                      },
                      position: 'relative',
                      '&::after': isActive ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: '3px',
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '0 4px 4px 0'
                      } : {}
                    }}
                    onClick={() => {
                      const memberData = otherMembers.map((member) => ({
                        name: member.name,
                        profilePicture: member.profilePicture,
                      }));
                      setCookies("memberData", memberData);
                      navigate(`/conversation/${conv.id}`);
                    }}
                  >
                    <ListItemAvatar>
                      <Box sx={{ position: 'relative' }}>
                        {otherMembers.slice(0, 1).map((member, index) => (
                          <Avatar
                            key={index}
                            src={member.profilePicture ?? ""}
                            name={member.name}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              border: isActive ? `2px solid ${theme.palette.primary.main}` : 'none'
                            }}
                          />
                        ))}
                        {otherMembers.length > 1 && (
                          <Box 
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: '50%',
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${theme.palette.divider}`,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: theme.palette.text.secondary
                            }}
                          >
                            +{otherMembers.length - 1}
                          </Box>
                        )}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={otherMembers.map((member) => member.name).join(", ")}
                      secondary={conv.lastMessage || "Start a conversation"}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        variant: "body1",
                        color: isActive ? 'primary' : 'textPrimary',
                        noWrap: true
                      }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        sx: {
                          opacity: 0.7,
                          fontSize: '0.85rem'
                        }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
};
