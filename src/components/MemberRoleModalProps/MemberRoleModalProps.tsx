import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { User } from "../../lib/interface";
import { RootState } from "../../Redux/store";
import {
  GET_MEMEBER_IN_PROJECT,
  UPDATE_ROLE,
  REMOVED_MEMBER_PROJECT,
} from "../../utils/Project/Project";
import { SEARCH_USER } from "../../utils/User/User";
import { INVITE_USER } from "../../utils/Inivitation/inivitaton";
import debounce from "lodash/debounce";

interface Member {
  User: [User & { idUser: string }];
  access: string;
}

interface ManageMembersModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const SearchUsersList = ({
  searchData,
  checkIfUserAlreadyInProject,
  onInvite,
}: {
  searchData: any;
  checkIfUserAlreadyInProject: (id: string) => boolean;
  onInvite: (user: User) => void;
}) => (
  <ul className="border border-gray-300 rounded-md mt-2">
    {searchData?.searchUserByName?.map((user: User) => (
      <li
        key={user.idUser}
        className="flex justify-between items-center p-2 hover:bg-gray-100"
      >
        <span>{user.name}</span>
        <button
          onClick={() =>
            !checkIfUserAlreadyInProject(user.idUser) && onInvite(user)
          }
          className="text-blue-500 hover:underline disabled:opacity-50"
          disabled={checkIfUserAlreadyInProject(user.idUser)}
        >
          {checkIfUserAlreadyInProject(user.idUser)
            ? "Already Joined"
            : "Invite"}
        </button>
      </li>
    ))}
  </ul>
);

const MembersList = ({
  members,
  currentUserId,
  isHost,
  onRoleChange,
  onRemove,
}: {
  members: Member[];
  currentUserId: string;
  isHost: boolean;
  onRoleChange: (member: Member, role: string) => void;
  onRemove: (id: string) => void;
}) => (
  <ul className="space-y-2">
    {members.map(
      (member) =>
        currentUserId !== member.User[0]?.idUser && (
          <li
            key={member.User[0]?.idUser}
            className="flex items-center justify-between gap-2 p-2 border-b border-gray-300"
          >
            <div className="flex items-center gap-2">
              <img
                src={member.User[0]?.profilePicture}
                alt={member.User[0]?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium">{member.User[0]?.name}</span>
              {member.access && (
                <span className="text-green-500 text-sm">
                  ({member.access})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isHost && (
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  onChange={(e) => onRoleChange(member, e.target.value)}
                  value={member.access}
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              )}
              <button
                className="text-red-500 hover:underline"
                onClick={() => onRemove(member.User[0]?.idUser)}
              >
                Remove
              </button>
            </div>
          </li>
        )
    )}
  </ul>
);

const ManageMembersModal = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
}: ManageMembersModalProps) => {
  const { idProject } = useParams();
  const [searchText, setSearchText] = useState("");
  const [isInviteMode, setIsInviteMode] = useState(false);

  const [updateRole] = useMutation(UPDATE_ROLE, {
    refetchQueries: [
      { query: GET_MEMEBER_IN_PROJECT, variables: { projectId: idProject } },
    ],
  });
  const [inviteUser] = useMutation(INVITE_USER);
  const [removeMember] = useMutation(REMOVED_MEMBER_PROJECT, {
    refetchQueries: [
      { query: GET_MEMEBER_IN_PROJECT, variables: { projectId: idProject } },
    ],
  });

  const [searchUser, { data: searchData, loading: searchLoading }] =
    useLazyQuery(SEARCH_USER);
  const { data: membersData, loading: membersLoading } = useQuery(
    GET_MEMEBER_IN_PROJECT,
    {
      variables: { projectId: idProject },
    }
  );

  const currentUserRole = useSelector(
    (state: RootState) => state.role?.role?.userRole
  );
  const currentUser = useSelector(
    (state: RootState) => state.user?.user?.currentUser
  );

  // Tạo debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.trim()) {
        searchUser({ variables: { searchText: searchValue } });
      }
    }, 500), 
    [searchUser]
  );

  const handleInviteUser = async (user: User) => {
    try {
      await inviteUser({
        variables: {
          emailContent: "You are invited to the project",
          projectId: idProject,
          userInvited: user.idUser,
        },
      });
      setSelectedUser(null);
      onClose();
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const checkIfUserAlreadyInProject = (userId: string) =>
    membersData?.getMememberInProject?.some(
      (member: Member) => member.User[0]?.idUser === userId
    ) ?? false;

  const handleEditPermission = async (member: Member, newRole: string) => {
    try {
      await updateRole({
        variables: {
          userId: member.User[0]?.idUser,
          role: newRole,
          projectId: idProject,
        },
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember({
        variables: {
          projectId: idProject,
          userId: memberId,
        },
      });
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                {isInviteMode ? "Invite Member" : "Manage Members"}
              </Dialog.Title>

              <div className="flex justify-between mb-4">
                <button
                  onClick={() => setIsInviteMode(true)}
                  className={`${isInviteMode ? "font-bold" : ""} text-blue-600`}
                >
                  Invite User
                </button>
                <button
                  onClick={() => setIsInviteMode(false)}
                  className={`${
                    !isInviteMode ? "font-bold" : ""
                  } text-blue-600`}
                >
                  Manage Members
                </button>
              </div>

              <div className="mt-4">
                {isInviteMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={searchText}
                      onChange={handleSearchUser}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Search user..."
                    />
                    {searchLoading ? (
                      <p className="text-blue-500">Searching...</p>
                    ) : (
                      searchData?.searchUserByName?.length > 0 && (
                        <SearchUsersList
                          searchData={searchData}
                          checkIfUserAlreadyInProject={
                            checkIfUserAlreadyInProject
                          }
                          onInvite={handleInviteUser}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div>
                    {membersLoading ? (
                      <p>Loading members...</p>
                    ) : (
                      <MembersList
                        members={membersData?.getMememberInProject || []}
                        currentUserId={currentUser?.sub}
                        isHost={currentUserRole?.is_host_user}
                        onRoleChange={handleEditPermission}
                        onRemove={handleRemoveMember}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ManageMembersModal;
