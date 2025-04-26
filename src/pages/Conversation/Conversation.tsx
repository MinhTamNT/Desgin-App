import { useQuery } from "@apollo/client";
import { ConversationList } from "../../components/ConversationList/ConversationList";
import { GET_CONERSATION } from "../../utils/Conversation/comversation";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { Outlet } from "react-router-dom";
import { Box, Paper, Typography, useTheme, useMediaQuery } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';

export const Conversation = () => {
  const { data: listConversation } = useQuery(GET_CONERSATION);
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      className="h-full"
      sx={{
        backgroundColor: theme.palette.background.default,
        padding: { xs: 1, sm: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 2,
          pl: 2
        }}
      >
        <ChatIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h5" fontWeight="500" color="primary">
          Conversations
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 2,
          height: '100%',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            },
            backgroundColor: theme.palette.background.paper
          }}
        >
          <ConversationList
            listConversation={listConversation?.getConversation}
            currentUserId={currentUser?.sub}
          />
        </Paper>

        <Paper 
          elevation={3}
          sx={{
            height: '100%',
            borderRadius: 2,
            overflow: isMobile ? 'auto' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            },
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Outlet />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
