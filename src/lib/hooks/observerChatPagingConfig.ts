import {ConversationPagingConfig} from "@/lib/hooks/useChatScrollAndPagination";
import {
    selectObserverJumpToMessageId,
    selectObserverScrollPositions,
} from "@/redux/observerChat/observerChatSelectors";
import {
    setObserverJumpToMessageId,
    setObserverScrollPosition,
    setObserverTopMostVisibleMessageId,
} from "@/redux/observerChat/observerChatUiSlice";
import {fetchObserverMessagesThunk} from "@/redux/observerChat/observerChatThunk";

export const OBSERVER_CHAT_PAGING_CONFIG: ConversationPagingConfig = {
    selectScrollPositions: selectObserverScrollPositions,
    selectJumpToMessageId: selectObserverJumpToMessageId,
    fetchMessagesThunk: fetchObserverMessagesThunk as any,
    setScrollPosition: ({roomId, scrollTop}) => setObserverScrollPosition({roomId, scrollTop}),
    setTopMostVisibleMessageId: ({roomId, messageId}) => setObserverTopMostVisibleMessageId({roomId, messageId}),
    setJumpToMessageId: (id) => setObserverJumpToMessageId(id),
};
