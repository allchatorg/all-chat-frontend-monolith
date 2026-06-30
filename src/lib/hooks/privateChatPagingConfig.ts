import {ConversationPagingConfig} from "@/lib/hooks/useChatScrollAndPagination";
import {selectPrivateChatScrollPositions, selectPrivateJumpToMessageId} from "@/redux/privateChat/privateChatSelectors";
import {
    setPrivateChatScrollPosition,
    setPrivateChatTopMostVisibleMessageId,
    setPrivateJumpToMessageId,
} from "@/redux/privateChat/privateChatUiSlice";
import {fetchPrivateChatMessagesThunk} from "@/redux/privateChat/privateChatThunk";

export const PRIVATE_CHAT_PAGING_CONFIG: ConversationPagingConfig = {
    selectScrollPositions: selectPrivateChatScrollPositions,
    selectJumpToMessageId: selectPrivateJumpToMessageId,
    fetchMessagesThunk: fetchPrivateChatMessagesThunk as any,
    setScrollPosition: ({roomId, scrollTop}) => setPrivateChatScrollPosition({roomId, scrollTop}),
    setTopMostVisibleMessageId: ({roomId, messageId}) => setPrivateChatTopMostVisibleMessageId({roomId, messageId}),
    setJumpToMessageId: (id) => setPrivateJumpToMessageId(id),
};
