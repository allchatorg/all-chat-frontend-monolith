import React from "react";
import PopularityRoomCard from "@/features/chatroom/components/PopularityRoomCard";
import {CreateChatRoomForm} from "@/features/chatroom/components/CreateChatRoomForm";
import {MessageCircle} from "lucide-react";
import {Role} from "@/models/Role";
import {RoomPopulation} from "@/models/roomPopulation";
import {User} from "@/models/User";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {RoomVipFilter} from "@/features/chatroom/hooks/useRoomSearch";

interface SearchRoomsResultsProps {
    isLoading: boolean;
    searchTerm: string;
    lastSearchedTerm: string;
    validationResult: string | true;
    filteredRooms: RoomPopulation[];
    showCreateOption: boolean;
    joinedRoomIds: Set<number>;
    user: User | null;
    onJoin: (roomId: number) => void;
    onCreate: () => void;
    vipOnly: boolean;
    onVipOnlyChange: (checked: boolean) => void;
    canCreate: boolean;
    vipModeLocked: boolean;
    isCreating: boolean;
    creationError: string | null;
    vipFilter: RoomVipFilter;
    onVipFilterChange: (filter: RoomVipFilter) => void;
}

const VIP_FILTER_EMPTY_LABEL: Record<RoomVipFilter, string> = {
    all: "rooms",
    vip: "VIP-only rooms",
    standard: "standard rooms",
};

const SearchRoomsResults: React.FC<SearchRoomsResultsProps> = ({
                                                                   isLoading,
                                                                   searchTerm,
                                                                   lastSearchedTerm,
                                                                   validationResult,
                                                                   filteredRooms,
                                                                   showCreateOption,
                                                                   joinedRoomIds,
                                                                   user,
                                                                   onJoin,
                                                                   onCreate, vipOnly, onVipOnlyChange, canCreate, vipModeLocked, isCreating, creationError,
                                                                   vipFilter, onVipFilterChange
                                                               }) => {
    return (
        <div className="p-3">
            <Tabs value={vipFilter} onValueChange={(value) => onVipFilterChange(value as RoomVipFilter)}
                  className="mb-3">
                <TabsList aria-label="Filter rooms by type" className="glass-surface grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="vip">VIP only</TabsTrigger>
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                </TabsList>
            </Tabs>
            {isLoading || (searchTerm.trim() && searchTerm.trim() !== lastSearchedTerm && validationResult === true) ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Searching...
                </div>
            ) : filteredRooms.length > 0 || showCreateOption ? (
                // The create CTA and the result list are independent: partial matches
                // (e.g. "tes" → "Test Room Alpha") must still offer creating "tes".
                <div className="space-y-3">
                    {showCreateOption && (
                        <CreateChatRoomForm name={searchTerm.trim()} vipOnly={vipOnly} onVipOnlyChange={onVipOnlyChange}
                            vipModeLocked={vipModeLocked} isVip={user?.vipActive === true} canCreate={canCreate}
                            isCreating={isCreating} error={creationError}
                            isGuest={user?.role === Role.GUEST} onCreate={onCreate}/>
                    )}
                    {filteredRooms.length > 0 && (
                        <div className="max-h-[300px] overflow-y-auto rounded-md border-border">
                            <div className="space-y-3">
                                {filteredRooms.map((room) => (
                                    <PopularityRoomCard
                                        key={room.roomId}
                                        room={room}
                                        onClick={() => onJoin(room.roomId)}
                                        isJoined={joinedRoomIds.has(room.roomId)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : validationResult !== true && searchTerm.trim().length > 2 ? (
                <div
                    className="glass-surface rounded-lg border-dashed p-4 flex items-start gap-2">
                    <span className="font-medium text-white/90">ℹ</span>
                    <p className="text-sm text-muted-foreground">{validationResult}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <MessageCircle className="mb-2 h-6 w-6 opacity-50"/>
                    {searchTerm.trim() ? (
                        <>
                            <p>No {VIP_FILTER_EMPTY_LABEL[vipFilter]} found matching "{searchTerm}"</p>
                            <p className="mt-1 text-sm">
                                {vipFilter === "all" ? "Try adjusting your search terms" : "Try another filter or search term"}
                            </p>
                        </>
                    ) : (
                        <>
                            <p>Search for a room to get started</p>
                            <p className="mt-1 text-sm">Type a room name above</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchRoomsResults;
