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
import { toast } from "react-toastify";

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
}) => {
  if (!searchData?.searchUserByName?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 mt-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-gray-500 text-center font-medium">No users found</p>
        <p className="text-gray-400 text-sm text-center mt-1">Try searching with a different name</p>
      </div>
    );
  }
  
  return (
    <ul className="mt-4 divide-y divide-gray-100 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {searchData?.searchUserByName?.map((user: User) => {
        const isAlreadyInProject = checkIfUserAlreadyInProject(user.idUser);
        return (
          <li
            key={user.idUser}
            className="flex justify-between items-center p-4 hover:bg-blue-50/30 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => !isAlreadyInProject && onInvite(user)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${isAlreadyInProject 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md active:scale-95'}`}
              disabled={isAlreadyInProject}
            >
              {isAlreadyInProject ? "Already Added" : "Invite"}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

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
}) => {
  const filteredMembers = members.filter(
    (member) => member.User[0]?.idUser !== currentUserId
  );

  if (filteredMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-gray-700 font-semibold text-lg">No team members</h3>
        <p className="text-gray-500 text-sm text-center mt-1 max-w-xs">
          Add team members to collaborate on this project
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      {filteredMembers.map((member) => {
        const memberRole = member.access === "ROLE_READ" ? "VIEWER" : "EDITOR";
        return (
          <li
            key={member.User[0]?.idUser}
            className="flex items-center justify-between p-4 hover:bg-blue-50/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {member.User[0]?.profilePicture ? (
                <img
                  src={member.User[0]?.profilePicture}
                  alt={member.User[0]?.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-lg shadow-sm">
                  {member.User[0]?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {member.User[0]?.name}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${memberRole === "VIEWER" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-blue-100 text-blue-700"}`}
                  >
                    {memberRole}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {member.User[0]?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                onChange={(e) => onRoleChange(member, e.target.value)}
                value={memberRole}
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                onClick={() => onRemove(member.User[0]?.idUser)}
                title="Remove member"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

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
     const res =  await inviteUser({
        variables: {
          emailContent: "You are invited to the project",
          projectId: idProject,
          userInvited: user.idUser,
        },
      });
      console.log(res)
      if(res?.data?.InvitedUser?.RetCode < 0){
        toast.error(res?.data?.InvitedUser?.RetMessgae )
      }
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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-0 shadow-2xl transition-all overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-blue-500 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <Dialog.Title className="text-xl font-semibold text-white">
                      {isInviteMode ? "Invite Team Members" : "Manage Team"}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors focus:outline-none rounded-full p-1 hover:bg-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setIsInviteMode(true)}
                    className={`flex-1 py-3 px-4 text-center transition-colors relative ${isInviteMode 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Invite User
                    </div>
                    {isInviteMode && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                  </button>
                  <button
                    onClick={() => setIsInviteMode(false)}
                    className={`flex-1 py-3 px-4 text-center transition-colors relative ${!isInviteMode 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Team Members
                    </div>
                    {!isInviteMode && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                  </button>
                </div>

                <div className="p-6">
                  {isInviteMode ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchText}
                          onChange={handleSearchUser}
                          className="w-full pl-10 pr-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Search for user by name..."
                        />
                      </div>

                      {searchLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-t-blue-500 border-l-blue-500 border-b-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Searching...</span>
                        </div>
                      ) : (
                        <SearchUsersList
                          searchData={searchData}
                          checkIfUserAlreadyInProject={checkIfUserAlreadyInProject}
                          onInvite={handleInviteUser}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      {membersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-t-blue-500 border-l-blue-500 border-b-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading team members...</span>
                        </div>
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

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    type="button"
                    className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
                    onClick={onClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ManageMembersModal;
