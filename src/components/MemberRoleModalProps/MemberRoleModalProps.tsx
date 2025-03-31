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
  setSelectedUser: (user: User | null) => void;
  selectedUser: User | null;
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
  onRoleChange,
  onRemove,
}: {
  members: Member[];
  currentUserId: string;
  onRoleChange: (member: Member, role: string) => void;
  onRemove: (id: string) => void;
}) => (
  <ul className="space-y-2">
    {members
      .filter((member) => member.User[0]?.idUser !== currentUserId)
      .map((member) => (
        <li
          key={member.User[0]?.idUser}
          className="flex items-center justify-between gap-4 p-3 border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <img
              src={member.User[0]?.profilePicture}
              alt={member.User[0]?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-gray-800">
                {member.User[0]?.name}
              </span>
              {member.access && (
                <span className="text-green-500 text-sm ml-2">
                  ({member.access})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onRoleChange(member, e.target.value)}
              value={member.access === "ROLE_READ" ? "VIEWER" : "EDITOR"}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              className="flex items-center text-red-500 hover:underline"
              onClick={() => onRemove(member.User[0]?.idUser)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Remove
            </button>
          </div>
        </li>
      ))}
  </ul>
);

const ManageMembersModal = ({
  open,
  onClose,
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

  const currentUser = useSelector(
    (state: RootState) => state.user?.user?.currentUser
  );

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
      console.log(member.User[0]?.idUser);
      const res = await updateRole({
        variables: {
          userId: member.User[0]?.idUser,
          role: newRole,
          projectId: idProject,
        },
      });
      console.log(res?.data?.updateRoleProject);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await removeMember({
        variables: {
          projectId: idProject,
          userId: memberId,
        },
      });
      console.log(res?.data?.removeUserFromProject);
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
