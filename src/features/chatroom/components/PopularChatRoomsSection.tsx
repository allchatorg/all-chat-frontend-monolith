import React, {useEffect, useState} from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {X} from "lucide-react";
import PopularityRoomCard from "@/features/chatroom/components/PopularityRoomCard";
import {useChatRooms} from "@/lib/hooks/useChatRooms";
import {useUser} from "@/lib/hooks/useUser";
import {Spinner} from "@/components/Spinner";
import {Button} from "@/components/ui/button";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {
    selectPromotedChatRoomsState,
    selectRoomPromotionUpdateCounter,
    selectTopOnlineChatRoomsState
} from "@/redux/chatRoom/chatRoomSelectors";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchPromotedRoomsPaginatedThunk, fetchTopOnlineRoomsPaginatedThunk} from "@/redux/chatRoom/chatRoomThunk";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {RoomSortByEnum} from "@/models/RoomSortByEnum";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const PAGE_SIZE = 8;
const POLL_INTERVAL = 10000;

type RoomsTab = "active" | "promoted";

const PopularChatRoomsSection: React.FC = () => {
    const {user} = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const [tab, setTab] = useState<RoomsTab>("active");
    const [fetchTopOnline, isLoading] = useThunk(fetchTopOnlineRoomsPaginatedThunk);
    const [fetchPromotedRooms, isPromotedLoading] = useThunk(fetchPromotedRoomsPaginatedThunk);
    const [sortBy, setSortBy] = useState<RoomSortByEnum>(RoomSortByEnum.ONLINE);
    const [noiseLevel, setNoiseLevel] = useState<string>("all");
    // Promoted page is local state so the effect below is the only fetch path
    // (page changes and ROOM_PROMOTION_UPDATE counter bumps both just re-run it).
    const [promotedPageIndex, setPromotedPageIndex] = useState(0);

    const makeFilterParams = () => ({
        chatRoomNoiseLevel: noiseLevel !== "all" ? noiseLevel : undefined,
    });

    const {content = [], totalPages = 0, number: pageIndex = 0} = useSelector(selectTopOnlineChatRoomsState);
    const {
        content: promotedContent = [],
        totalPages: promotedTotalPages = 0,
    } = useSelector(selectPromotedChatRoomsState);
    // Bumped by ROOM_PROMOTION_UPDATE broadcasts so the open Promoted tab refetches live.
    const roomPromotionUpdateCounter = useSelector(selectRoomPromotionUpdateCounter);
    const {userChatRooms: joinedRooms, handleJoinRoom: handleJoin} = useChatRooms(user);
    const joinedRoomNames = new Set(joinedRooms?.map(r => r.chatRoomName));
    const currentPage = pageIndex + 1;
    const promotedCurrentPage = promotedPageIndex + 1;
    const isActiveTab = tab === "active";
    const isPromotedTab = tab === "promoted";

    // Active tab: fetch rooms on mount, page change, and filters change
    useEffect(() => {
        if (!isActiveTab) return;
        fetchTopOnline({page: pageIndex, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
    }, [isActiveTab, fetchTopOnline, pageIndex, sortBy, noiseLevel]);

    // Active tab: poll for updates
    useEffect(() => {
        if (!isActiveTab) return;
        const interval = setInterval(() => {
            fetchTopOnline({page: pageIndex, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isActiveTab, fetchTopOnline, pageIndex, sortBy, noiseLevel]);

    // Promoted tab: fetch on open, page change, and every promotion broadcast
    useEffect(() => {
        if (!isPromotedTab) return;
        fetchPromotedRooms({page: promotedPageIndex, pageSize: PAGE_SIZE});
    }, [isPromotedTab, fetchPromotedRooms, promotedPageIndex, roomPromotionUpdateCounter]);

    // Promoted tab: poll so the live room stats stay fresh
    useEffect(() => {
        if (!isPromotedTab) return;
        const interval = setInterval(() => {
            fetchPromotedRooms({page: promotedPageIndex, pageSize: PAGE_SIZE});
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isPromotedTab, fetchPromotedRooms, promotedPageIndex]);

    if (!user) {
        return (
            <div className="flex items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    const handleClose = () => dispatch(setActiveRightSidebar(null));

    const handleRoomClick = (roomId: number) => {
        handleJoin(roomId);
        if (isMobile) {
            handleClose();
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchTopOnline({page: page - 1, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
    };

    const handlePromotedPageChange = (page: number) => {
        if (page < 1 || page > promotedTotalPages) return;
        setPromotedPageIndex(page - 1);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value as RoomSortByEnum);
        if (pageIndex !== 0) {
            fetchTopOnline({
                page: 0,
                pageSize: PAGE_SIZE,
                popularitySort: value as RoomSortByEnum, ...makeFilterParams()
            });
        }
    };

    const handleNoiseLevelChange = (value: string) => {
        setNoiseLevel(value);
        if (pageIndex !== 0) {
            fetchTopOnline({page: 0, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
        }
    };

    return (
        <Card className="bg-transparent! flex h-full w-full flex-col border-0 shadow-none">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div className="w-6 h-6"></div>
                    <CardTitle className="text-base font-semibold tracking-tight">
                        {isActiveTab ? "Active Rooms" : "Promoted Rooms"}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="glass-control">
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            </CardHeader>

            <div className="px-4 pb-3">
                <Tabs value={tab} onValueChange={(value) => setTab(value as RoomsTab)}>
                    <TabsList className="glass-surface grid w-full grid-cols-2">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="promoted">Promoted</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {isActiveTab && (
                <div className="flex flex-col space-y-2 px-4 pb-3">
                    {/* Sort by filter */}
                    <div
                        className="glass-surface flex items-center rounded-lg p-2 transition">
                        <span className="text-sm text-muted-foreground font-medium">Sort by</span>
                        <div className="ml-auto">
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="glass-control h-8 w-[140px] text-sm">
                                    <SelectValue placeholder="Sort by"/>
                                </SelectTrigger>
                                <SelectContent className="glass-popover">
                                    <SelectItem value={RoomSortByEnum.ONLINE}>Online Users</SelectItem>
                                    <SelectItem value={RoomSortByEnum.ACTIVE}>Active Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Noise level filter */}
                    <div
                        className="glass-surface flex items-center rounded-lg p-2 transition">
                        <span className="text-sm text-muted-foreground font-medium">Noise level</span>
                        <div className="ml-auto">
                            <Select value={noiseLevel} onValueChange={handleNoiseLevelChange}>
                                <SelectTrigger className="glass-control h-8 w-[140px] text-sm">
                                    <SelectValue placeholder="Noise level"/>
                                </SelectTrigger>
                                <SelectContent className="glass-popover">
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value={ChatRoomNoiseLevelEnum.QUIET}>Quiet</SelectItem>
                                    <SelectItem value={ChatRoomNoiseLevelEnum.CONVERSATIONAL}>Conversational</SelectItem>
                                    <SelectItem value={ChatRoomNoiseLevelEnum.NOISY}>Noisy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            <CardContent className="flex flex-1 flex-col overflow-hidden px-4">
                <div aria-orientation={"vertical"} className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {isActiveTab ? (
                            isLoading && content.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div
                                        className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground">Loading rooms...</p>
                                </div>
                            ) : content.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">No rooms online.</div>
                            ) : (
                                content.map((room) => (
                                    <PopularityRoomCard
                                        key={room.roomName}
                                        room={room}
                                        onClick={() => handleRoomClick(room.roomId)}
                                        isJoined={joinedRoomNames.has(room.roomName)}
                                    />
                                ))
                            )
                        ) : (
                            isPromotedLoading && promotedContent.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div
                                        className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground">Loading rooms...</p>
                                </div>
                            ) : promotedContent.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">No promoted rooms yet.</div>
                            ) : (
                                promotedContent.map((room) => (
                                    <PopularityRoomCard
                                        key={room.roomId}
                                        room={room}
                                        onClick={() => handleRoomClick(room.roomId)}
                                        isJoined={joinedRoomNames.has(room.roomName)}
                                    />
                                ))
                            )
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                {isActiveTab ? (
                    <PaginationFooter
                        className="w-full"
                        totalPages={totalPages || 0}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                ) : (
                    <PaginationFooter
                        className="w-full"
                        totalPages={promotedTotalPages || 0}
                        currentPage={promotedCurrentPage}
                        onPageChange={handlePromotedPageChange}
                    />
                )}
            </CardFooter>
        </Card>
    );
};

export default PopularChatRoomsSection;
