"use client";

import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {cn} from "@/lib/utils";
import {Card} from "@/components/ui/card";
import {MessagesSquare} from "lucide-react";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useThunk} from "@/lib/hooks/useThunk";
import AdminConversationList from "@/features/adminConversations/components/AdminConversationList";
import ObserverChatSection from "@/features/adminConversations/components/ObserverChatSection";
import ObserverSearchMessages from "@/features/adminConversations/components/ObserverSearchMessages";
import ChatSearchBar from "@/features/chatroom/components/ChatSearchBar";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {
    fetchObserverConversationsThunk,
    searchObserverMessagesThunk,
    selectAndLoadObserverChatThunk,
} from "@/redux/observerChat/observerChatThunk";
import {
    clearObserverChat,
    closeObserverMessageSearch,
    openObserverMessageSearch,
    setObserverMessageSearchParams,
    setObserverSearchTerm,
    setObserverTargetUser,
} from "@/redux/observerChat/observerChatSlice";
import {
    selectObserverConversations,
    selectObserverConversationsLoading,
    selectObserverConversationsPage,
    selectObserverMessageSearchOpen,
    selectObserverSearchTerm,
    selectObserverSelectedChatLoading,
    selectSelectedObserverChatId,
    selectSelectedObserverChatRoom,
    selectSelectedObserverConversation,
} from "@/redux/observerChat/observerChatSelectors";

interface AdminConversationsViewProps {
    userId: number;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 300;

const AdminConversationsView: React.FC<AdminConversationsViewProps> = ({userId}) => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();

    const conversations = useSelector(selectObserverConversations);
    const conversationsLoading = useSelector(selectObserverConversationsLoading);
    const conversationsPage = useSelector(selectObserverConversationsPage);
    const searchTerm = useSelector(selectObserverSearchTerm);
    const selectedChatId = useSelector(selectSelectedObserverChatId);
    const selectedConversation = useSelector(selectSelectedObserverConversation);
    const selectedRoom = useSelector(selectSelectedObserverChatRoom);
    const selectedChatLoading = useSelector(selectObserverSelectedChatLoading);
    const messageSearchOpen = useSelector(selectObserverMessageSearchOpen);

    const [fetchConversations] = useThunk(fetchObserverConversationsThunk);
    const [selectAndLoad] = useThunk(selectAndLoadObserverChatThunk);
    const [searchMessages] = useThunk(searchObserverMessagesThunk);

    const [mobileChatOpen, setMobileChatOpen] = useState(false);

    // Bind the slice to this profile; wipe everything when leaving the tab.
    useEffect(() => {
        dispatch(setObserverTargetUser(userId));
        return () => {
            dispatch(clearObserverChat());
        };
    }, [dispatch, userId]);

    // Initial load (delay 0) + debounced re-fetch on search.
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchConversations({userId, search: searchTerm, page: 0, pageSize: PAGE_SIZE});
        }, searchTerm ? SEARCH_DEBOUNCE : 0);
        return () => clearTimeout(handler);
    }, [userId, searchTerm, fetchConversations]);

    const handleSearchChange = (value: string) => {
        dispatch(setObserverSearchTerm(value));
    };

    const handleSelect = (roomId: number) => {
        // Switching conversations invalidates the (conversation-scoped) search results.
        if (roomId !== selectedChatId) {
            dispatch(closeObserverMessageSearch());
        }
        selectAndLoad(roomId);
        if (isMobile) {
            setMobileChatOpen(true);
        }
    };

    const handlePageChange = (page: number) => {
        fetchConversations({userId, search: searchTerm, page, pageSize: PAGE_SIZE});
    };

    // Search is scoped to the currently selected conversation.
    const handleMessageSearch = (request: SearchMessageRequest) => {
        if (!selectedChatId) return;
        const scoped = {...request, chatRoomId: selectedChatId};
        dispatch(setObserverMessageSearchParams(scoped));
        dispatch(openObserverMessageSearch());
        searchMessages({request: scoped});
    };

    // On mobile the results pane takes over the screen; jumping to a result swaps to the chat.
    const handleSearchResultJump = () => {
        if (isMobile) {
            dispatch(closeObserverMessageSearch());
            setMobileChatOpen(true);
        }
    };

    const showSearchPane = messageSearchOpen;
    const showChatPane = !isMobile ? true : (mobileChatOpen && !messageSearchOpen);
    const showListPane = !isMobile ? true : (!mobileChatOpen && !messageSearchOpen);

    return (
        <div className="flex h-full min-h-0 w-full gap-3">
            <div
                className={cn(
                    "h-full min-h-0 w-full lg:w-80 lg:shrink-0",
                    showListPane ? "block" : "hidden",
                )}
            >
                <Card className="glass-panel flex h-full min-h-0 flex-col p-3">
                    <AdminConversationList
                        conversations={conversations}
                        selectedRoomId={selectedChatId}
                        isLoading={conversationsLoading}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        onSelect={handleSelect}
                        totalPages={conversationsPage?.totalPages ?? 0}
                        currentPage={conversationsPage?.number ?? 0}
                        onPageChange={handlePageChange}
                    />
                </Card>
            </div>

            <div
                className={cn(
                    "h-full min-h-0 flex-1 flex-col gap-3",
                    showChatPane ? "flex" : "hidden",
                )}
            >
                {selectedConversation ? (
                    <>
                        <div className="shrink-0">
                            {/* key resets the filter pills when switching conversations */}
                            <ChatSearchBar
                                key={selectedChatId}
                                onSearch={handleMessageSearch}
                                enabledFilters={['fname']}
                                placeholder="Search this conversation… (try fname:report)"
                            />
                        </div>
                        <div className="min-h-0 flex-1">
                            <ObserverChatSection
                                conversation={selectedConversation}
                                chatRoom={selectedRoom}
                                isLoading={selectedChatLoading && !selectedRoom}
                                onOpenMobileSidebar={isMobile ? () => setMobileChatOpen(false) : undefined}
                            />
                        </div>
                    </>
                ) : (
                    <Card
                        className="glass-panel flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                        <MessagesSquare className="h-8 w-8"/>
                        <span>Select a conversation to review</span>
                    </Card>
                )}
            </div>

            {showSearchPane && (
                <div
                    className={cn(
                        "h-full min-h-0",
                        isMobile ? "w-full" : "w-full lg:w-96 lg:shrink-0",
                    )}
                >
                    <ObserverSearchMessages onJump={handleSearchResultJump}/>
                </div>
            )}
        </div>
    );
};

export default AdminConversationsView;
