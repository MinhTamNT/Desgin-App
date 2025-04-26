import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { 
  Button, 
  CircularProgress, 
  TextField, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  InputAdornment,
  Badge,
  Fade
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Message as MessageType } from "../../lib/interface";
import { RootState } from "../../Redux/store";
import {
  CREATE_MESSAGE,
  GET_MESSAGE_CONVERSATIONID,
  GET_MESSAGE_SUB,
} from "../../utils/Message/Message";
import Cookies from "universal-cookie";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

export const Message = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messageText, setMessageText] = useState("");
  const [message, setMessage] = useState<MessageType[]>([]);
  const cookie = new Cookies();
  const conversationData = cookie.get("memberData");
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [getMessages, { loading, error, data }] = useLazyQuery<{
    getMessageConversationId: MessageType[];
  }>(GET_MESSAGE_CONVERSATIONID, {
    variables: { conversationId },
  });

  const [sendMessage] = useMutation(CREATE_MESSAGE, {
    onCompleted: () => {
      setMessageText("");
      getMessages();
    },
  });

  useSubscription(GET_MESSAGE_SUB, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.messageCreated) {
        const newMessage = subscriptionData.data.messageCreated;
        setMessage((prevMessage) => [...prevMessage, newMessage]);
      }
    },
  });

  useEffect(() => {
    if (conversationId) {
      getMessages(); 
    }
  }, [conversationId, getMessages]);

  useEffect(() => {
    if (data?.getMessageConversationId) {
      setMessage(data.getMessageConversationId);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [data]);

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (messageText.trim() && conversationId) {
      sendMessage({
        variables: {
          conversationId,
          message: messageText,
        },
      });
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <Typography variant="body1" color="error">
        Error: {error.message}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100vh', 
        bgcolor: theme.palette.background.default,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            {conversationData?.slice(0, 1).map((data: any, index: number) => (
              <Badge
                key={index}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#44b700',
                    color: '#44b700',
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                    '&::after': {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      animation: 'ripple 1.2s infinite ease-in-out',
                      border: '1px solid currentColor',
                      content: '""',
                    },
                  },
                  '@keyframes ripple': {
                    '0%': {
                      transform: 'scale(.8)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: 'scale(2.4)',
                      opacity: 0,
                    },
                  },
                }}
              >
                <Avatar
                  src={data.profilePicture}
                  alt={data.name}
                  sx={{ width: 48, height: 48 }}
                />
              </Badge>
            ))}
            {conversationData?.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${theme.palette.background.paper}`,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                +{conversationData.length - 1}
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="500">
              {conversationData?.map((data: any) => data.name).join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isTyping ? (
                <Fade in={true}>
                  <Box component="span" sx={{ color: theme.palette.primary.main }}>
                    typing...
                  </Box>
                </Fade>
              ) : 'Online'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Message List */}
      <Box
        sx={{
          flexGrow: 1,
          height: '400px', // Fixed height for the chat area
          maxHeight: '400px',
          overflow: 'auto',
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0.2)})`
        }}
      >
        {message.length === 0 ? (
          <Box
            sx={{
              height: '300px', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.7
            }}
          >
            <Typography variant="body1" color="text.secondary" align="center">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          message.map((msg, index) => {
            const isCurrentUser = msg?.sender?.uuid === currentUser?.sub;
            const showAvatar = index === 0 || 
              message[index - 1]?.sender?.uuid !== msg?.sender?.uuid;
              
            return (
              <Box
                key={`${msg.conversationId || index}`}
                sx={{
                  display: 'flex',
                  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  mb: 2,
                  gap: 1.5
                }}
              >
                {!isCurrentUser && showAvatar ? (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mb: 0.5,
                      visibility: showAvatar ? 'visible' : 'hidden'
                    }}
                    src={undefined} 
                  />
                ) : (
                  <Box sx={{ width: 32 }} /> 
                )}
                
                <Box
                  sx={{
                    maxWidth: '70%',
                    position: 'relative'
                  }}
                >
                  {/* Message bubble */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      ...(isCurrentUser
                        ? {
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            borderBottomRightRadius: showAvatar ? 0 : 8,
                          }
                        : {
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            borderBottomLeftRadius: showAvatar ? 0 : 8,
                          }),
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                  </Paper>
                  
                  {/* Timestamp */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      textAlign: isCurrentUser ? 'right' : 'left',
                      color: 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  >
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              setIsTyping(Math.random() > 0.7);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(); 
              }
            }}
            multiline
            maxRows={3}
            InputProps={{
              sx: {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                },
                pr: 1
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Add emoji">
                      <IconButton size="small" color="primary">
                        <EmojiEmotionsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Attach file">
                      <IconButton size="small" color="primary">
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            sx={{
              borderRadius: '50%',
              minWidth: 48,
              height: 48,
              boxShadow: 2
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
