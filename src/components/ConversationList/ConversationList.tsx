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
} from "@mui/material";
import { CREATE_CONVERSATION } from "../../utils/Conversation/comversation";
import { useLazyQuery, useMutation } from "@apollo/client";
import { SEARCH_USER } from "../../utils/User/User";
import { Avatar } from "../Avatar/Avatar";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

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
    <Box className="p-4">
      <Paper
        elevation={0}
        className="p-2 max-w-4xl mx-auto rounded-md flex items-center gap-2"
      >
        <TextField
          size="small"
          variant="outlined"
          label="Search User..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button
          variant="contained"
          color="primary"
          className="flex-shrink-0"
          onClick={handleSearchClick}
        >
          Search
        </Button>
      </Paper>

      {loading && (
        <Box className="mt-2 flex justify-center">
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="error" className="mt-2">
          Error: {error.message}
        </Typography>
      )}
      {data && data.searchUserByName.length === 0 && (
        <Typography variant="body2" className="mt-2">
          No users found.
        </Typography>
      )}
      {data && data.searchUserByName.length > 0 && (
        <Box className="mt-4">
          <List>
            {data.searchUserByName.map((user: User) => (
              <ListItem
                key={user.idUser}
                className="border-b border-gray-300 relative hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  createConversation({ variables: { receiverId: user.idUser } })
                }
              >
                <ListItemAvatar>
                  <Avatar src={user.profilePicture ?? ""} name={user.name} />
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {creatingConversation && (
        <Box className="mt-2 flex justify-center">
          <CircularProgress />
        </Box>
      )}

      <Box className="mt-4">
        <Typography variant="h6">Your Conversations</Typography>
        {conversations.length === 0 ? (
          <Typography variant="body2">No conversations found.</Typography>
        ) : (
          <List>
            <List>
              {conversations.map((conv) => {
                const otherMembers = conv.members.filter(
                  (member) => (member.uuid as string) !== currentUserId
                );
                return (
                  <ListItem
                    key={conv.id}
                    className="border-b border-gray-300"
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
                      {otherMembers.map((member, index) => (
                        <Avatar
                          key={index}
                          src={member.profilePicture ?? ""}
                          name={member.name}
                        />
                      ))}
                    </ListItemAvatar>
                    <ListItemText
                      primary={otherMembers
                        .map((member) => member.name)
                        .join(", ")}
                    />
                  </ListItem>
                );
              })}
            </List>
          </List>
        )}
      </Box>
    </Box>
  );
};
