import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Message as MessageType } from "../../lib/interface";
import { RootState } from "../../Redux/store";
import {
  CREATE_MESSAGE,
  GET_MESSAGE_CONVERSATIONID,
  GET_MESSAGE_SUB,
} from "../../utils/Message/Message";

export const Message = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messageText, setMessageText] = useState("");
  const [message, setMessage] = useState<MessageType[]>([]);

  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

  const [getMessages, { loading, error, data }] = useLazyQuery<{
    getMessageConversationId: MessageType[];
  }>(GET_MESSAGE_CONVERSATIONID, {
    variables: { conversationId },
  });

  const [sendMessage] = useMutation(CREATE_MESSAGE, {
    onCompleted: () => {
      setMessageText("");
      getMessages(); // Refetch messages after sending a new one
    },
  });

  useSubscription(GET_MESSAGE_SUB, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.messageCreated) {
        const newMessage = subscriptionData.data.messageCreated;
        console.log(newMessage);
        setMessage((prevMessage) => [...prevMessage, newMessage]);
      }
    },
  });

  useEffect(() => {
    if (conversationId) {
      getMessages(); // Trigger the query when conversationId changes
    }
  }, [conversationId, getMessages]);

  useEffect(() => {
    if (data?.getMessageConversationId) {
      setMessage(data.getMessageConversationId);
    }
  }, [data]);

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

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box className="flex flex-col h-screen">
      {/* Header */}
      <Box className="p-4 bg-gray-100 flex items-center border-b">
        {/* Header content such as user avatar and name can go here */}
      </Box>

      {/* Message List */}
      <Box className="flex-grow p-4 overflow-y-auto">
        {message.map((msg) => (
          <Box
            key={msg.conversationId}
            className={`mb-4 p-3 rounded-lg max-w-md ${
              msg?.sender?.uuid === currentUser?.sub
                ? "bg-blue-100 self-start"
                : "bg-green-100 self-end"
            }`}
          >
            <Typography variant="body1">{msg.text}</Typography>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box className="p-4 bg-gray-100 border-t flex items-center gap-2">
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage(); // Send message on Enter key press
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};
