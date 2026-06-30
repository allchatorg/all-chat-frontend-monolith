import React from "react";
import PopularityRoomCard from "@/features/chatroom/components/PopularityRoomCard";
import {GuestModalWrapper} from "@/components/GuestModalWrapper";
import {MessageCircle, MessageSquarePlus} from "lucide-react";
import {Role} from "@/models/Role";
import {RoomPopulation} from "@/models/roomPopulation";
import {User} from "@/models/User";

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
}

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
                                                                   onCreate
                                                               }) => {
    return (
        <div className="p-3">
            {isLoading || (searchTerm.trim() && searchTerm.trim() !== lastSearchedTerm && validationResult === true) ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Searching...
                </div>
            ) : filteredRooms.length > 0 ? (
                <div className="h-[300px] overflow-y-auto rounded-md border-border p-3">
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
            ) : showCreateOption ? (
                <GuestModalWrapper
                    isGuest={user?.role === Role.GUEST}
                    onProceed={() => {
                    }}
                >
                    <div
                        onClick={onCreate}
                        className="glass-surface cursor-pointer rounded-lg border-dashed p-4 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquarePlus className="min-h-4 w-4"/>
                            <div className="min-w-0">
                                <p className="text-foreground truncate max-w-full">
                                    No matching chatroom "{searchTerm.trim()}"
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Click here to create it
                                </p>
                            </div>
                        </div>
                    </div>
                </GuestModalWrapper>
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
                            <p>No rooms found matching "{searchTerm}"</p>
                            <p className="mt-1 text-sm">Try adjusting your search terms</p>
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
