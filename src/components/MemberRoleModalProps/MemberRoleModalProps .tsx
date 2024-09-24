import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "../../lib/interface";
import { INVITE_USER } from "../../utils/Inivitation/inivitaton";
import { GET_MEMEBER_IN_PROJECT } from "../../utils/Project/Project";
import { SEARCH_USER } from "../../utils/User/User";
import { RootState } from "../../Redux/store";
import { useSelector } from "react-redux";

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
  const [inviteUser] = useMutation(INVITE_USER);
  const currentUserRole = useSelector(
    (state: RootState) => state.role?.role?.userRole
  );
  const currentUser = useSelector(
    (state: RootState) => state.user?.user?.currentUser
  );
  console.log(currentUserRole);
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

  const handleEditPermission = async (member: any, newRole: string) => {
    console.log(`Updating role to ${newRole} for ${member.User[0].name}`);
    // Add your permission update mutation logic here
    // For example, you can trigger a mutation to update user roles
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {isInviteMode ? "Invite Member" : "Manage Members"}
                </Dialog.Title>

                <div className="mt-4">
                  {isInviteMode ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchUser}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none sm:text-sm"
                        placeholder="Search user..."
                      />
                      {searchLoading && <p>Loading...</p>}
                      {searchError && <p>Error fetching users.</p>}
                      <ul className="mt-2 max-h-48 overflow-auto">
                        {searchData?.searchUserByName
                          .filter(
                            (user: User) => user.idUser !== currentUser?.sub
                          )
                          .map((user: User) => (
                            <li
                              key={user.idUser}
                              onClick={() => setSelectedUser(user)}
                              className={`p-2 cursor-pointer ${
                                selectedUser?.idUser === user.idUser
                                  ? "bg-blue-100"
                                  : ""
                              }`}
                            >
                              {user.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      {membersLoading ? (
                        <p>Loading members...</p>
                      ) : membersError ? (
                        <p>Error loading members.</p>
                      ) : (
                        <ul>
                          {membersData?.getMememberInProject.map(
                            (member: any) =>
                              // Only display the member if the current user is not the member
                              currentUser?.sub !== member.User[0].idUser && (
                                <li
                                  key={member.User[0].idUser}
                                  className="flex items-center justify-between gap-2 p-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={member.User[0].profilePicture}
                                      alt={member.User[0].name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <span>{member.User[0].name}</span>
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
                                        handleEditPermission(
                                          member,
                                          e.target.value
                                        )
                                      }
                                      defaultValue={member.access}
                                    >
                                      <option value="VIEWER">Viewer</option>
                                      <option value="EDITOR">Editor</option>
                                    </select>
                                  )}
                                </li>
                              )
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between">
                  {isInviteMode && selectedUser ? (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200"
                      onClick={handleInviteUser}
                    >
                      Invite
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                      onClick={onClose}
                    >
                      Save Role
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>

                <button
                  onClick={() => setIsInviteMode(!isInviteMode)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {isInviteMode
                    ? "Switch to Manage Members"
                    : "Switch to Invite Members"}
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ManageMembersModal;
