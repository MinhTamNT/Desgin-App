import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { User } from "../../lib/interface";
import { useParams } from "react-router-dom";
import { SEARCH_USER } from "../../utils/User/User";
import { GET_MEMEBER_IN_PROJECT } from "../../utils/Project/Project";

interface ManageMembersModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  projectId: string; // Ensure projectId is provided
}

const ManageMembersModal = ({
  open,
  onClose,
  selectedUser,
  setSelectedUser,
  projectId,
}: ManageMembersModalProps) => {
  const { idProject } = useParams();
  const [role, setRole] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isInviteMode, setIsInviteMode] = useState<boolean>(false);

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

  const handleRoleChange = (newRole: string) => setRole(newRole);

  const handleInviteUser = () => {
    if (selectedUser) {
      console.log(`Inviting ${selectedUser.name} with role ${role}`);
      setSelectedUser(null);
      setRole(null);
      onClose();
    }
  };

  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) searchUser({ variables: { searchText: value } });
  };

  const handleSaveRole = () => {
    console.log(`Setting role of ${selectedUser?.name} to ${role}`);
    onClose();
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
                        {searchData?.searchUserByName.map((user: User) => (
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
                      <select
                        value={role || ""}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none sm:text-sm"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
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
                            (member: any) => (
                              <li
                                key={member.User[0].idUser}
                                className="flex items-center gap-2 p-2"
                              >
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
                      onClick={handleSaveRole}
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
