import { useQuery } from "@apollo/client";
import { ConversationList } from "../../components/ConversationList/ConversationList";
import { GET_CONERSATION } from "../../utils/Conversation/comversation";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { Outlet } from "react-router-dom";

export const Conversation = () => {
  const { data: listConversation, loading, error } = useQuery(GET_CONERSATION);
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full">
        <div className="col-span-1 shadow-md rounded-md h-[calc(100vh - 60px)] max-w-full bg-white p-4 overflow-auto">
          <ConversationList
            listConversation={listConversation?.getConversation}
            currentUserId={currentUser?.sub}
          />
        </div>
        <div className="col-span-1 md:col-span-2 bg-white shadow-md rounded-xl p-4 h-[calc(100vh - 60px)] overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
