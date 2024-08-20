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
import { useLazyQuery, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { INVITE_USER } from "../../utils/Inivitation/inivitaton";
import { useParams } from "react-router-dom";

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
  const { idProject } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [InvitedUser] = useMutation(INVITE_USER);
  const [searchUser, { loading, data }] = useLazyQuery<{
    searchUserByName: User[];
  }>(SEARCH_USER);
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

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

  const handleInvite = async () => {
    try {
      for (const user of selectedUsers) {
        await InvitedUser({
          variables: {
            emailContent: `Invite ${user.name} to join the project`,
            projectId: idProject,
            userInvited: user?.idUser,
          },
        });
      }
      onClose();
      setSearchTerm("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="text-xl font-bold p-4">Search User</DialogTitle>
      <DialogContent className="p-4">
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
        />
        {loading && <CircularProgress className="block mx-auto my-4" />}
        <List>
          {searchTerm.length > 0 && (
            <>
              {data?.searchUserByName
                ?.filter((user) => user.idUser !== currentUser?.sub) // Filter out the current user
                .map((user) => (
                  <ListItem
                    key={user.idUser}
                    onClick={() => handleSelectUser(user)}
                    selected={!!selectedUsers.find((u) => u.sub === user.sub)}
                    className="mb-2 border border-gray-300 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profilePicture} />
                    </ListItemAvatar>
                    <ListItemText primary={user.name} secondary={user.email} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={
                          !!selectedUsers.find((u) => u.sub === user.sub)
                        }
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </>
          )}
        </List>
      </DialogContent>
      <DialogActions className="p-4">
        <Button onClick={onClose} color="primary" className="mr-2">
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
