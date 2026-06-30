import React from "react";
import {useRoomSearch} from "@/features/chatroom/hooks/useRoomSearch";
import SearchRoomsResults from "@/features/chatroom/components/SearchRoomsResults";
import {Search, X} from "lucide-react";
import {Input} from "@/components/ui/input";

interface SearchRoomsMobileProps {
    onClose: () => void;
}

const SearchRoomsMobile: React.FC<SearchRoomsMobileProps> = ({onClose}) => {
    const {
        searchTerm,
        setSearchTerm,
        rooms,
        searchRoomIsLoading,
        handleJoinRoom,
        handleCreateChatRoom,
        clearSearch,
        showCreateOption,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    } = useRoomSearch();

    const onJoin = (roomId: number) => {
        handleJoinRoom(roomId);
        onClose();
    };

    const onCreate = () => {
        handleCreateChatRoom().then(() => {
            onClose();
        });
    };

    return (
        <div className="w-full flex flex-col md:h-[500px]">
            <div className="px-4 py-2 border-b">
                <div className="relative w-full">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-700/90 dark:text-white/90"/>
                    <Input
                        type="text"
                        placeholder="Search or create a room…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="glass-input w-full pr-10 pl-10"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <SearchRoomsResults
                    isLoading={searchRoomIsLoading}
                    searchTerm={searchTerm}
                    lastSearchedTerm={lastSearchedTerm}
                    validationResult={validationResult as string | true}
                    filteredRooms={rooms}
                    showCreateOption={showCreateOption}
                    joinedRoomIds={joinedRoomIds}
                    user={user}
                    onJoin={onJoin}
                    onCreate={onCreate}
                />
            </div>
        </div>
    );
};

export default SearchRoomsMobile;
