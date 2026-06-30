import * as React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {useThunk} from "@/lib/hooks/useThunk";
import {getUserMessagesThunk} from "@/redux/modPanel/modPanelThunk";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {selectModPanelChatRoomMessages, selectModPanelUserInfo} from "@/redux/modPanel/modPanelSelector";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {Message} from "@/models/message";
import {setJumpToMessageId} from "@/redux/chatRoom/chatRoomUiSlice";
import SearchMessagesDisplay from "@/features/chatroom/components/SearchMessagesDisplay";

const PAGE_SIZE = 10;
type Props = {};
export const SearchUserMessagesInChatRoom = (props: Props) => {
    const dispatch = useDispatch<AppDispatch>();

    const selectedUserInfo = useSelector(selectModPanelUserInfo);
    const selectedChatRoom = useSelector(selectSelectedChatRoomState);
    const chatRoomId = selectedChatRoom?.id;

    const {content = [], totalPages = 0, number: pageIndex = 0} = useSelector(selectModPanelChatRoomMessages);
    const currentPage = pageIndex + 1;

    const [fetchMessages, messagesLoading, messagesError] = useThunk(getUserMessagesThunk);


    const handlePageChange = (page: number): void => {
        if (!chatRoomId || page < 1 || page > totalPages || !selectedUserInfo.selectedUserName) return;
        const params: SearchMessageRequest = {
            page: page - 1,
            size: PAGE_SIZE,
            chatRoomId: chatRoomId,
            senderUsername: selectedUserInfo.selectedUserName,
        };
        fetchMessages(params);
    };

    const handleJumpToMessageClick = (message: Message) => {
        dispatch(setJumpToMessageId(null));
        setTimeout(() => dispatch(setJumpToMessageId(message.id)));
    };

    return (
        <SearchMessagesDisplay
            showTitle={false}
            messages={content}
            isLoading={messagesLoading}
            error={messagesError}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onMessageClick={handleJumpToMessageClick}
        />
    );
};