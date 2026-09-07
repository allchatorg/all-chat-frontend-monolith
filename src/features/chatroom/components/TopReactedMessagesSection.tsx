import React, {useEffect, useState} from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/redux/store";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";
import {selectSelectedChatRoomState, selectTopReactedMessagesState} from "@/redux/chatRoom/chatRoomSelectors";
import PaginationFooter from "@/components/PaginationFooter";
import {fetchTopReactedMessagesThunk} from "@/redux/chatRoom/chatRoomThunk";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {setJumpToMessageId} from "@/redux/chatRoom/chatRoomUiSlice";
import {Message} from "@/models/message";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {TopReactedPeriodEnum} from "@/models/TopReactedPeriodEnum";

const PAGE_SIZE = 10;
const POLL_INTERVAL = 10000;

export const TopReactedMessagesSection: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const [period, setPeriod] = useState<TopReactedPeriodEnum>(TopReactedPeriodEnum.ALL_TIME);

    const roomId = useSelector((state: RootState) =>
        selectSelectedChatRoomState(state)?.id);
    const topReactedMessagesState = useSelector(selectTopReactedMessagesState);
    const {content = [], totalPages = 0} = topReactedMessagesState || {};

    // Request state must not depend on the response: updating `number` after a
    // page fetch would otherwise trigger another fetch for that same page.
    const [pageIndex, setPageIndex] = useState(0);
    const [pageRoomId, setPageRoomId] = useState(roomId);
    if (pageRoomId !== roomId) {
        setPageRoomId(roomId);
        setPageIndex(0);
    }

    const currentPage = pageIndex + 1;

    useEffect(() => {
        if (roomId == null) return;
        const fetchPage = () => {
            void dispatch(fetchTopReactedMessagesThunk({roomId, page: pageIndex, size: PAGE_SIZE, period}));
        };
        fetchPage();
        const interval = setInterval(fetchPage, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [roomId, pageIndex, period, dispatch]);

    const handleClose = () => dispatch(setActiveLeftSidebar(null));

    const handlePageChange = (page: number) => {
        if (roomId == null || page < 1 || page > totalPages) return;
        setPageIndex(page - 1);
    };

    const handlePeriodChange = (value: string) => {
        setPeriod(value as TopReactedPeriodEnum);
        setPageIndex(0);
    };

    const handleMessageClick = (message: Message) => {
        dispatch(setJumpToMessageId(message.id));
        if (isMobile) {
            handleClose();
        }
    };

    return (
        <Card className="bg-transparent! flex h-full w-full flex-col border-0 shadow-none">
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

            <div className="flex flex-col space-y-2 px-4 pb-3">
                <div className="glass-surface flex items-center rounded-lg p-2 transition">
                    <span className="text-sm text-muted-foreground font-medium">Period</span>
                    <div className="ml-auto">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="glass-control h-8 w-[140px] text-sm">
                                <SelectValue placeholder="Period"/>
                            </SelectTrigger>
                            <SelectContent className="glass-popover">
                                <SelectItem value={TopReactedPeriodEnum.ALL_TIME}>All time</SelectItem>
                                <SelectItem value={TopReactedPeriodEnum.THIS_YEAR}>This year</SelectItem>
                                <SelectItem value={TopReactedPeriodEnum.THIS_MONTH}>This month</SelectItem>
                                <SelectItem value={TopReactedPeriodEnum.THIS_WEEK}>This week</SelectItem>
                                <SelectItem value={TopReactedPeriodEnum.TODAY}>Today</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <CardContent className="flex flex-1 flex-col overflow-hidden px-4 pb-0">
                <div aria-orientation={"vertical"} className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {roomId == null ? (
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
