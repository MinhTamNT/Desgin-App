import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Checkbox,
  ListItemSecondaryAction,
} from "@mui/material";
import { SEARCH_USER } from "../../utils/User/User";
import { User } from "../../lib/interface";
import { useLazyQuery } from "@apollo/client";

interface DialogSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectUsers: (users: User[]) => void;
}

const DialogSearch: React.FC<DialogSearchProps> = ({
  open,
  onClose,
  onSelectUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchUser, { loading, data }] = useLazyQuery<{
    searchUserByName: User[];
  }>(SEARCH_USER);

  useEffect(() => {
    if (searchTerm) {
      searchUser({ variables: { searchText: searchTerm } });
    }
  }, [searchTerm, searchUser]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.find((u) => u.sub === user.sub)) {
        return prevSelectedUsers.filter((u) => u.sub !== user.sub);
      } else {
        return [...prevSelectedUsers, user];
      }
    });
  };

  const handleInvite = () => {
    onSelectUsers(selectedUsers);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        style={{ fontSize: "1.25rem", fontWeight: "bold", padding: "16px" }}
        className="ldg:w-[500px] w-full"
      >
        Search User
      </DialogTitle>
      <DialogContent style={{ padding: "16px", paddingBottom: 0 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Search"
          type="text"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
          variant="outlined"
          style={{ marginBottom: "16px" }}
        />
        {loading && (
          <CircularProgress style={{ display: "block", margin: "16px auto" }} />
        )}
        <List>
          {data?.searchUserByName?.map((user) => (
            <ListItem
              key={user.sub}
              onClick={() => handleSelectUser(user)}
              selected={!!selectedUsers.find((u) => u.sub === user.sub)}
              style={{
                marginBottom: "8px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                transition: "background-color 0.3s",
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.picture} />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.email} />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  checked={!!selectedUsers.find((u) => u.sub === user.sub)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions style={{ padding: "16px" }}>
        <Button
          onClick={onClose}
          color="primary"
          style={{ marginRight: "8px" }}
        >
          Cancel
        </Button>
        <Button onClick={handleInvite} color="primary" variant="contained">
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogSearch;
