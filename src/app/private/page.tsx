"use client";

import React, {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {Spinner} from "@/components/Spinner";
import {Sheet, SheetContent} from "@/components/ui/sheet";
import {useUser} from "@/lib/hooks/useUser";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {usePrivateChats} from "@/features/privateChat/hooks/usePrivateChats";
import PrivateChatsSidebar from "@/features/privateChat/components/PrivateChatsSidebar";
import PrivateRoomTabs from "@/features/privateChat/components/PrivateRoomTabs";
import PrivateChatSection from "@/features/privateChat/components/PrivateChatSection";
import PrivateChatEmptyState from "@/features/privateChat/components/PrivateChatEmptyState";
import PrivateRightPanel from "@/features/privateChat/components/PrivateRightPanel";
import ChatSectionSkeleton from "@/features/chatroom/components/ChatSectionSkeleton";
import {selectOpenPrivateChatTabs, selectPrivateSidebarVisible} from "@/redux/privateChat/privateChatSelectors";
import {
    reorderPrivateChatTabs,
    reorderPrivateConversations,
    setPrivateSidebarVisible,
} from "@/redux/privateChat/privateChatUiSlice";
import {ROUTES} from "@/routes";
import {sidePanelDesktopClass} from "@/features/chatroom/components/sidePanelGlassClasses";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";

export default function PrivateChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const {user} = useUser();
    const sidebarVisible = useSelector(selectPrivateSidebarVisible);
    const openTabs = useSelector(selectOpenPrivateChatTabs);

    const urlRoomId = searchParams.get("chatRoomId")
        ? parseInt(searchParams.get("chatRoomId") as string, 10)
        : undefined;

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const {
        conversations,
        conversationsLoading,
        selectedConversation,
        selectedChatId,
        selectedChatRoom,
        selectedChatLoading,
        handleSelectChat,
        handleHideChat,
        handleCloseTab,
    } = usePrivateChats(user, urlRoomId);

    useEffect(() => {
        if (!user) {
            router.replace(ROUTES.AUTH);
            return;
        }
        if (!user.claimed) {
            router.replace(ROUTES.HOME);
        }
    }, [user, router]);

    // Keep URL in sync with the selected conversation
    useEffect(() => {
        const current = searchParams.get("chatRoomId");
        if (!selectedChatId) {
            // No conversation selected (e.g. last tab closed): drop the stale
            // chatRoomId so a refresh doesn't re-open the closed chat.
            if (current) {
                router.replace(ROUTES.PRIVATE_CHAT);
            }
            return;
        }
        if (current !== String(selectedChatId)) {
            router.replace(`${ROUTES.PRIVATE_CHAT}?chatRoomId=${selectedChatId}`);
        }
    }, [selectedChatId]);

    if (!user || !user.claimed) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    const onSelect = (conversation: PrivateChatDTO) => {
        handleSelectChat(conversation);
        if (isMobile) setMobileSidebarOpen(false);
    };

    const onHide = (roomId: number) => {
        void handleHideChat(roomId);
    };

    const sidebar = (
        <PrivateChatsSidebar
            conversations={conversations}
            selectedChatId={selectedChatId}
            isLoading={conversationsLoading}
            onSelect={onSelect}
            onHide={onHide}
            onReorder={(reordered) => dispatch(reorderPrivateConversations(reordered.map(c => c.id)))}
            onCloseSidebar={isMobile ? () => setMobileSidebarOpen(false) : undefined}
            showCloseButton={!isMobile && sidebarVisible}
        />
    );

    return (
        <div className="flex h-full w-full gap-x-4 p-2 pb-0 md:p-0 md:px-4">
            {/* Desktop sidebar */}
            {!isMobile && sidebarVisible && (
                <div className={sidePanelDesktopClass}>
                    {sidebar}
                </div>
            )}

            {/* Mobile sidebar sheet */}
            {isMobile && (
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-[320px]">
                        {sidebar}
                    </SheetContent>
                </Sheet>
            )}

            <div className="flex w-full h-full min-h-0 flex-1 flex-col min-w-0">
                {openTabs.length > 0 && (
                    <div className="-mt-4 -ml-1">
                        <PrivateRoomTabs
                            tabs={openTabs}
                            selectedChatId={selectedChatId}
                            onSelect={onSelect}
                            onClose={handleCloseTab}
                            onReorder={(reordered) => dispatch(reorderPrivateChatTabs(reordered.map(t => t.id)))}
                        />
                    </div>
                )}

                <div className="min-h-0 flex-1">
                    {!selectedConversation ? (
                        <PrivateChatEmptyState
                            onOpenSidebar={
                                isMobile
                                    ? () => setMobileSidebarOpen(true)
                                    : !sidebarVisible
                                        ? () => dispatch(setPrivateSidebarVisible(true))
                                        : undefined
                            }
                        />
                    ) : selectedChatLoading && !selectedChatRoom ? (
                        <ChatSectionSkeleton/>
                    ) : (
                        <PrivateChatSection
                            conversation={selectedConversation}
                            chatRoom={selectedChatRoom}
                            currentUserId={user.id}
                            isLoading={selectedChatLoading && !selectedChatRoom}
                            onHideConversation={() => onHide(selectedConversation.id)}
                            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                        />
                    )}
                </div>
            </div>

            <PrivateRightPanel/>
        </div>
    );
}
