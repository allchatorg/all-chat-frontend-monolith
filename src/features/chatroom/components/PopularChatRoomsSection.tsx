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
import {selectTopOnlineChatRoomsState} from "@/redux/chatRoom/chatRoomSelectors";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchTopOnlineRoomsPaginatedThunk} from "@/redux/chatRoom/chatRoomThunk";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {RoomSortByEnum} from "@/models/RoomSortByEnum";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const PAGE_SIZE = 2;
const POLL_INTERVAL = 10000;

const PopularChatRoomsSection: React.FC = () => {
    const {user} = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const [fetchTopOnline, isLoading] = useThunk(fetchTopOnlineRoomsPaginatedThunk);
    const [sortBy, setSortBy] = useState<RoomSortByEnum>(RoomSortByEnum.ONLINE);
    const [noiseLevel, setNoiseLevel] = useState<string>("all");

    const makeFilterParams = () => ({
        chatRoomNoiseLevel: noiseLevel !== "all" ? noiseLevel : undefined,
    });

    const {content = [], totalPages = 0, number: pageIndex = 0} = useSelector(selectTopOnlineChatRoomsState);
    const {userChatRooms: joinedRooms, handleJoinRoom: handleJoin} = useChatRooms(user);
    const joinedRoomNames = new Set(joinedRooms?.map(r => r.chatRoomName));
    const currentPage = pageIndex + 1;

    // Fetch rooms on mount, page change, and filters change
    useEffect(() => {
        fetchTopOnline({page: pageIndex, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
    }, [fetchTopOnline, pageIndex, sortBy, noiseLevel]);

    // Poll for updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTopOnline({page: pageIndex, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchTopOnline, pageIndex, sortBy, noiseLevel]);

    if (!user) {
        return (
            <div className="flex items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    const handleClose = () => dispatch(setActiveRightSidebar(null));

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchTopOnline({page: page - 1, pageSize: PAGE_SIZE, popularitySort: sortBy, ...makeFilterParams()});
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
        <Card className="!bg-transparent flex h-full w-full flex-col border-0 shadow-none">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div className="w-6 h-6"></div>
                    <CardTitle className="text-base font-semibold tracking-tight">Active Rooms</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="glass-control">
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            </CardHeader>

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

            <CardContent className="flex flex-1 flex-col overflow-hidden px-4">
                <div aria-orientation={"vertical"} className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {isLoading && content.length === 0 ? (
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
                                    onClick={() => {
                                        handleJoin(room.roomId);
                                        if (isMobile) {
                                            handleClose();
                                        }
                                    }}
                                    isJoined={joinedRoomNames.has(room.roomName)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <PaginationFooter
                    className="w-full"
                    totalPages={totalPages || 0}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </CardFooter>
        </Card>
    );
};

export default PopularChatRoomsSection;
