import React, {useEffect} from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";
import {selectSelectedChatRoomState, selectTopReactedMessagesState} from "@/redux/chatRoom/chatRoomSelectors";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchTopReactedMessagesThunk} from "@/redux/chatRoom/chatRoomThunk";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {setJumpToMessageId} from "@/redux/chatRoom/chatRoomUiSlice";
import {Message} from "@/models/message";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const PAGE_SIZE = 10;
const POLL_INTERVAL = 10000;

export const TopReactedMessagesSection: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const [fetchTopReactedMessages] = useThunk(fetchTopReactedMessagesThunk);

    const activeRoom = useSelector(selectSelectedChatRoomState);
    const topReactedMessagesState = useSelector(selectTopReactedMessagesState);
    const {content = [], totalPages = 0, number: pageIndex = 0} = topReactedMessagesState || {};

    const currentPage = pageIndex + 1;

    useEffect(() => {
        if (!activeRoom) return;
        fetchTopReactedMessages({roomId: activeRoom.id, page: pageIndex, size: PAGE_SIZE});
    }, [activeRoom?.id, pageIndex, fetchTopReactedMessages]);

    useEffect(() => {
        if (!activeRoom) return;
        const interval = setInterval(() => {
            fetchTopReactedMessages({roomId: activeRoom.id, page: pageIndex, size: PAGE_SIZE});
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [activeRoom?.id, pageIndex, fetchTopReactedMessages]);

    const handleClose = () => dispatch(setActiveLeftSidebar(null));

    const handlePageChange = (page: number) => {
        if (!activeRoom || page < 1 || page > totalPages) return;
        fetchTopReactedMessages({roomId: activeRoom.id, page: page - 1, size: PAGE_SIZE});
    };

    const handleMessageClick = (message: Message) => {
        dispatch(setJumpToMessageId(message.id));
        if (isMobile) {
            handleClose();
        }
    };

    return (
        <Card className="!bg-transparent flex h-full w-full flex-col border-0 shadow-none">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div className="w-6 h-6"></div>
                    <CardTitle className="text-base font-semibold tracking-tight text-center">Top Reacted
                        Messages</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="glass-control">
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden px-4 pb-0">
                <div aria-orientation={"vertical"} className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {!activeRoom ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">Select a room to view top
                                reacted messages.</div>
                        ) : content.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">No recorded messages
                                found.</div>
                        ) : (
                            content.map((message) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    viewMode="search"
                                    handleMessageClick={handleMessageClick}
                                    showChatRoomName={false}
                                    showSenderName={true}
                                    showReactions={true}
                                />
                            ))
                        )}
                    </div>
                </div>
            </CardContent>

            {totalPages > 1 && (
                <CardFooter className="p-0">
                    <PaginationFooter
                        className="w-full"
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            )}
        </Card>
    );
};

export default TopReactedMessagesSection;
