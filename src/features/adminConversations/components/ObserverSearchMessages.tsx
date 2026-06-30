'use client';

import React from 'react';
import {useUser} from "@/lib/hooks/useUser";
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/redux/store';
import {useThunk} from '@/lib/hooks/useThunk';
import {jumpToObserverMessageThunk, searchObserverMessagesThunk,} from '@/redux/observerChat/observerChatThunk';
import {closeObserverMessageSearch} from '@/redux/observerChat/observerChatSlice';
import {
    selectObserverMessageSearchParams,
    selectObserverMessageSearchResults,
} from '@/redux/observerChat/observerChatSelectors';
import {SearchMessageRequest} from '@/models/SearchMessageRequest';
import {Message} from "@/models/message";
import SearchMessagesDisplay from '@/features/chatroom/components/SearchMessagesDisplay';

const PAGE_SIZE = 10;

interface ObserverSearchMessagesProps {
    // Called after a result is clicked (used on mobile to swap the pane to the chat view).
    onJump?: () => void;
}

// Right-hand results pane for the admin conversation message search. Mirrors the public-chat
// SearchChatroomMessages, scoped to the currently selected conversation; clicking a result
// scrolls to and highlights it in the open chat pane.
const ObserverSearchMessages: React.FC<ObserverSearchMessagesProps> = ({onJump}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const [searchMessages, isLoading, error] = useThunk(searchObserverMessagesThunk);

    const params = useSelector(selectObserverMessageSearchParams);
    const results = useSelector(selectObserverMessageSearchResults);

    const {content = [], totalPages = 0, number: pageIndex = 0} = results || {};
    const currentPage = pageIndex + 1;

    const handlePageChange = (page: number): void => {
        if (page < 1 || page > totalPages) return;
        const request: SearchMessageRequest = {
            page: page - 1,
            size: PAGE_SIZE,
            chatRoomId: params?.chatRoomId,
            senderUsername: params?.senderUsername,
            content: params?.content,
            attachmentName: params?.attachmentName,
        };
        searchMessages({request});
    };

    const handleJumpToMessageClick = (message: Message) => {
        if (message.chatRoomId == null) return;
        dispatch(jumpToObserverMessageThunk({roomId: message.chatRoomId, messageId: message.id}));
        onJump?.();
    };

    return (
        <div className="h-full">
            <SearchMessagesDisplay
                title="Search results"
                showTitle={true}
                showMessageChatRoomName={false}
                messages={content}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onMessageClick={handleJumpToMessageClick}
                onClose={() => dispatch(closeObserverMessageSearch())}
                blockedUserIds={user?.blockedUsers?.map(u => u.id) || []}
            />
        </div>
    );
};

export default ObserverSearchMessages;
