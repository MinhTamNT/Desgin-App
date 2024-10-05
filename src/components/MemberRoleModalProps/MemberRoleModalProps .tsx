import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { User } from "../../lib/interface";
import { RootState } from "../../Redux/store";
import { INVITE_USER } from "../../utils/Inivitation/inivitaton";
import {
  GET_MEMEBER_IN_PROJECT,
  UPDATE_ROLE,
  REMOVED_MEMBER_PROJECT,
} from "../../utils/Project/Project";
import { SEARCH_USER } from "../../utils/User/User";

interface ManageMembersModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const ManageMembersModal = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
}: ManageMembersModalProps) => {
  const { idProject } = useParams();
  const [searchText, setSearchText] = useState<string>("");
  const [isInviteMode, setIsInviteMode] = useState<boolean>(false);

  const [updateRole] = useMutation(UPDATE_ROLE);
  const [inviteUser] = useMutation(INVITE_USER);
  const [removeMember] = useMutation(REMOVED_MEMBER_PROJECT);
  const currentUserRole = useSelector(
    (state: RootState) => state.role?.role?.userRole
  );
  const currentUser = useSelector(
    (state: RootState) => state.user?.user?.currentUser
  );

  const [
    searchUser,
    { data: searchData, loading: searchLoading, error: searchError },
  ] = useLazyQuery(SEARCH_USER);

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
  } = useQuery(GET_MEMEBER_IN_PROJECT, {
    variables: { projectId: idProject },
  });

  const handleInviteUser = async () => {
    if (selectedUser) {
      try {
        await inviteUser({
          variables: {
            emailContent: "You are invited to the project",
            projectId: idProject,
            userInvited: selectedUser.idUser,
          },
        });
        console.log(`Inviting ${selectedUser.name}`);
        setSelectedUser(null);
        onClose();
      } catch (error) {
        console.error("Error inviting user:", error);
      }
    }
  };

  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) searchUser({ variables: { searchText: value } });
  };

  const checkIfUserAlreadyInProject = (userId: string) => {
    return (
      membersData?.getMememberInProject?.some(
        (member: any) => member.User[0]?.idUser === userId
      ) ?? false
    );
  };

  const handleEditPermission = async (member: any, newRole: string) => {
    console.log(`Updating role to ${newRole} for ${member.User[0]?.name}`);
    try {
      await updateRole({
        variables: {
          userId: member.User[0]?.idUser,
          role: newRole,
          projectId: idProject,
        },
      });
      console.log(`Role updated to ${newRole} for ${member.User[0]?.name}`);
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
      console.log(`Member with ID ${memberId} removed from project.`);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                >
                  {isInviteMode ? "Invite Member" : "Manage Members"}
                </Dialog.Title>

                {/* Toggle Invite Mode */}
                <div className="flex justify-between mb-4">
                  <button
                    onClick={() => setIsInviteMode(true)}
                    className={`${
                      isInviteMode ? "font-bold" : ""
                    } text-blue-600`}
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
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchUser}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Search user..."
                      />
                      {searchLoading && (
                        <p className="text-blue-500">Searching...</p>
                      )}
                      {searchError && (
                        <p className="text-red-500">Error occurred!</p>
                      )}
                      {searchData?.searchUserByName?.length > 0 && (
                        <ul className="border border-gray-300 rounded-md mt-2">
                          {searchData.searchUserByName.map((user: User) => (
                            <li
                              key={user.idUser}
                              className="flex justify-between items-center p-2 hover:bg-gray-100"
                            >
                              <span>{user.name}</span>
                              <button
                                onClick={() => {
                                  if (
                                    !checkIfUserAlreadyInProject(user.idUser)
                                  ) {
                                    setSelectedUser(user);
                                    handleInviteUser();
                                  } else {
                                    console.log(
                                      `${user.name} is already in the project`
                                    );
                                  }
                                }}
                                className="text-blue-500 hover:underline"
                              >
                                {checkIfUserAlreadyInProject(user.idUser)
                                  ? "Join"
                                  : "Invite"}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Members:</h4>
                      <ul>
                        {membersLoading && <p>Loading members...</p>}
                        {membersError && (
                          <p className="text-red-500">Error loading members!</p>
                        )}
                        {membersData?.getMememberInProject?.map((member: any) =>
                          currentUser?.sub !== member.User[0]?.idUser ? (
                            <li
                              key={member.User[0]?.idUser}
                              className="flex items-center justify-between gap-2 p-2 border-b border-gray-300"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={member.User[0]?.profilePicture}
                                  alt={member.User[0]?.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-medium">
                                  {member.User[0]?.name}
                                </span>
                                {member.access && (
                                  <span className="text-green-500">
                                    (Access Granted)
                                  </span>
                                )}
                              </div>

                              {currentUserRole?.is_host_user && (
                                <select
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                  onChange={(e) =>
                                    handleEditPermission(member, e.target.value)
                                  }
                                  defaultValue={member.access}
                                >
                                  <option value="EDITOR">Editor</option>
                                  <option value="VIEWER">Viewer</option>
                                </select>
                              )}

                              {/* Button to Remove Member */}
                              <button
                                className="text-red-500 hover:underline"
                                onClick={() =>
                                  handleRemoveMember(member.User[0]?.idUser)
                                }
                              >
                                Remove
                              </button>
                            </li>
                          ) : null
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
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
