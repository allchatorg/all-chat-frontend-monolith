'use client';

import React from 'react';
import {useUser} from "@/lib/hooks/useUser";
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/redux/store';
import {
    selectSearchedMessagesState,
    selectSearchMessagesParams,
    selectSelectedChatRoomState,
} from '@/redux/chatRoom/chatRoomSelectors';
import {useThunk} from '@/lib/hooks/useThunk';
import {searchChatRoomMessagesThunk} from '@/redux/chatRoom/chatRoomThunk';
import {SearchMessageRequest} from '@/models/SearchMessageRequest';
import {setJumpToMessageId} from '@/redux/chatRoom/chatRoomUiSlice';
import SearchMessagesDisplay from './SearchMessagesDisplay';
import {Message} from "@/models/message";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const PAGE_SIZE = 10;

const SearchChatroomMessages: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const [searchMessages, isLoading, error] = useThunk(searchChatRoomMessagesThunk);
    const isMobile = useIsMobile();

    const searchMessageParams = useSelector(selectSearchMessagesParams);
    const selectedChatRoom = useSelector(selectSelectedChatRoomState);
    const chatRoomId = selectedChatRoom?.id;

    const {content = [], totalPages = 0, number: pageIndex = 0} = useSelector(selectSearchedMessagesState) || {};
    const currentPage = pageIndex + 1;

    const handlePageChange = (page: number): void => {
        if (!chatRoomId || page < 1 || page > totalPages) return;
        const params: SearchMessageRequest = {
            page: page - 1,
            size: PAGE_SIZE,
            senderUsername: searchMessageParams?.senderUsername,
            content: searchMessageParams?.content,
        };
        searchMessages({roomId: chatRoomId, request: params});
    };

    const handleJumpToMessageClick = (message: Message) => {
        dispatch(setJumpToMessageId(null));
        setTimeout(() => dispatch(setJumpToMessageId(message.id)));
    };

    return (
        <div className="h-full">
            <SearchMessagesDisplay
                title={`Search ${selectedChatRoom?.name} Messages`}
                showTitle={true}
                messages={content}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onMessageClick={handleJumpToMessageClick}
                onClose={() => {
                    if (isMobile) {
                        dispatch(setActiveRightSidebar(null));
                    } else {
                        dispatch(setActiveRightSidebar("top-online"));
                    }
                }}
                blockedUserIds={user?.blockedUsers?.map(u => u.id) || []}
            />
        </div>
    );
};

export default SearchChatroomMessages;
