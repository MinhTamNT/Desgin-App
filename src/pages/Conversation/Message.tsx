import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { Button, CircularProgress, TextField, Typography } from "@mui/material";
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
import Cookies from "universal-cookie";

export const Message = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messageText, setMessageText] = useState("");
  const [message, setMessage] = useState<MessageType[]>([]);
  const cookie = new Cookies();
  const conversationData = cookie.get("memberData");
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
    <div className="flex flex-col w-full h-screen">
      <div className="p-4 bg-white   text-[#333] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {conversationData?.map((data: any) => (
            <>
              <img
                src={data.profilePicture}
                className="w-10 h-10 rounded-full"
              />
              <span>{data.name}</span>
            </>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="flex w-full flex-col flex-1 p-4 overflow-y-auto bg-gray-50">
        {message.map((msg) => (
          <div
            key={msg.conversationId}
            className={`mb-4 p-3 flex rounded-xl max-w-lg ${
              msg?.sender?.uuid === currentUser?.sub
                ? "bg-blue-500 text-white self-end rounded-br-none shadow-lg"
                : "bg-white text-gray-800 self-start rounded-bl-none shadow-md"
            }`}
          >
            <Typography variant="body1" className="leading-relaxed">
              {msg.text}
            </Typography>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-200 border-t flex items-center gap-2">
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage(); // Send message on Enter key press
          }}
          className="rounded-lg"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          className="ml-2 rounded-full"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
