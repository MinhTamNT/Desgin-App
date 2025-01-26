import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { SEARCH_USER } from "../../utils/User/User";
import { User } from "../../lib/interface";
import { useLazyQuery, useMutation } from "@apollo/client";
import { INVITE_USER } from "../../utils/Inivitation/inivitaton";
import { useParams } from "react-router-dom";
import { ApolloError } from "@apollo/client";

interface DialogInviteProps {
  open: boolean;
  onClose: () => void;
  onInvite: () => void;
}

interface SearchUserResponse {
  searchUserByName: User[];
}

const DialogInvite: React.FC<DialogInviteProps> = ({
  open,
  onClose,
  onInvite,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const { idProject } = useParams();

  const [searchUsers] = useLazyQuery(SEARCH_USER, {
    onCompleted: (data: SearchUserResponse) => {
      setSearchResults(data?.searchUserByName || []);
    },
    onError: (error: ApolloError) => {
      console.error(error);
    },
  });

  const [inviteUser] = useMutation(INVITE_USER);

  console.log(searchQuery);
  useEffect(() => {
    if (searchQuery) {
      searchUsers({ variables: { searchText: searchQuery } });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);

  const handleAddMember = (user: User) => {
    if (!selectedMembers.find((u) => u.idUser === user.idUser)) {
      setSelectedMembers((prev) => [...prev, user]);
    }
    setSearchQuery("");
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((u) => u.idUser !== userId));
  };

  const handleInvite = async () => {
    try {
      await Promise.all(
        selectedMembers.map((user) =>
          inviteUser({
            variables: {
              emailContent: `You have been invited to join the project.`,
              projectId: idProject,
              userInvited: user.idUser,
            },
          })
        )
      );
      onInvite(); 
      onClose(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Members</DialogTitle>
      <DialogContent>
        <TextField
          label="Search for members"
          value={searchQuery}
          onChange={(e) => {
            console.log(e.target.value); // Log giá trị nhập vào
            setSearchQuery(e.target.value);
          }}
          fullWidth
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          {searchResults.length === 0 && searchQuery ? (
            <p className="text-sm text-gray-600 mt-2">
              No results found for "{searchQuery}".
            </p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.idUser}
                onClick={() => handleAddMember(user)}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{user.name}</span>
              </div>
            ))
          )}
          <h3 className="text-lg font-semibold mt-4">Selected Members</h3>
          {selectedMembers.length === 0 ? (
            <p className="text-sm text-gray-600 mt-2">
              No members selected yet.
            </p>
          ) : (
            selectedMembers.map((user) => (
              <div
                key={user.idUser}
                className="flex items-center mb-2 p-2 rounded-md border border-gray-200"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="flex-grow">{user.name}</span>
                <Button
                  onClick={() => handleRemoveMember(user.idUser)}
                  color="secondary"
                  size="small"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleInvite} color="primary">
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogInvite;
