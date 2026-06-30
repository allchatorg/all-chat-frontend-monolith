"use client";

import React from "react";
import {AnimatePresence, motion} from "framer-motion";
import {X} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {Button} from "@/components/ui/button";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import SearchMessagesDisplay from "@/features/chatroom/components/SearchMessagesDisplay";
import {
    sidePanelDesktopClass,
    sidePanelMobileClass,
    sidePanelMobileContentClass,
} from "@/features/chatroom/components/sidePanelGlassClasses";
import {
    selectPrivateActiveRightPanel,
    selectPrivateSearchedMessages,
    selectPrivateSearchMessagesParams,
    selectSelectedPrivateChatId,
    selectSelectedPrivateConversation,
} from "@/redux/privateChat/privateChatSelectors";
import {setPrivateActiveRightPanel, setPrivateJumpToMessageId} from "@/redux/privateChat/privateChatUiSlice";
import {setSearchPrivateMessagesParams} from "@/redux/privateChat/privateChatSlice";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchPrivateChatMessagesThunk} from "@/redux/privateChat/privateChatThunk";
import {Message} from "@/models/message";
import {useUser} from "@/lib/hooks/useUser";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const PrivateRightPanelContent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const isMobile = useIsMobile();
    const [searchMessages, isLoading, error] = useThunk(searchPrivateChatMessagesThunk);
    const selectedChatId = useSelector(selectSelectedPrivateChatId);
    const conversation = useSelector(selectSelectedPrivateConversation);
    const searchParams = useSelector(selectPrivateSearchMessagesParams);
    const searchedMessages = useSelector(selectPrivateSearchedMessages);

    const {content = [], totalPages = 0, number: pageIndex = 0} = searchedMessages || {};
    const currentPage = pageIndex + 1;

    const handlePageChange = (page: number) => {
        if (!selectedChatId || !searchParams) return;
        if (page < 1 || page > totalPages) return;
        const request = {...searchParams, page: page - 1};
        dispatch(setSearchPrivateMessagesParams(request));
        searchMessages({roomId: selectedChatId, request});
    };

    const handleJumpToMessage = (message: Message) => {
        // On mobile the panel covers the conversation, so close it to reveal the jumped-to message.
        if (isMobile) {
            dispatch(setPrivateActiveRightPanel(null));
        }
        dispatch(setPrivateJumpToMessageId(null));
        setTimeout(() => dispatch(setPrivateJumpToMessageId(message.id)));
    };

    const handleClose = () => {
        dispatch(setPrivateActiveRightPanel(null));
    };

    const counterpartName = conversation?.counterpart?.username ?? "user";

    return (
        <Card className="glass-panel flex h-full min-h-0 w-full flex-1 flex-col border-0">
            <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-2 p-4">
                <CardTitle className="text-sm">Search messages with {counterpartName}</CardTitle>
                <Button variant="ghost" size="sm" className="glass-control" onClick={handleClose} aria-label="Close">
                    <X className="h-4 w-4"/>
                </Button>
            </CardHeader>
            <Separator className="flex-shrink-0"/>
            <div className="flex-1 overflow-hidden">
                <SearchMessagesDisplay
                    title=""
                    showTitle={false}
                    messages={content}
                    isLoading={isLoading}
                    error={error}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onMessageClick={handleJumpToMessage}
                    blockedUserIds={user?.blockedUsers?.map(u => u.id) || []}
                />
            </div>
        </Card>
    );
};

const PrivateRightPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const activePanel = useSelector(selectPrivateActiveRightPanel);

    let content: React.ReactNode = null;
    if (activePanel === "search-messages") {
        content = <PrivateRightPanelContent/>;
    }

    const handleClose = () => {
        dispatch(setPrivateActiveRightPanel(null));
    };

    if (!content) return null;

    return (
        <>
            <div className={sidePanelDesktopClass}>{content}</div>

            <AnimatePresence>
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    onClick={handleClose}
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{y: "100%"}}
                    animate={{y: 0}}
                    exit={{y: "100%"}}
                    transition={{type: "spring", damping: 25, stiffness: 200}}
                    className={sidePanelMobileClass}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={sidePanelMobileContentClass}>{content}</div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default PrivateRightPanel;
