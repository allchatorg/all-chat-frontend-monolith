"use client";

import React, {useEffect, useState} from "react";
import {Search, Shuffle, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useRoomSearch} from "@/features/chatroom/hooks/useRoomSearch";
import SearchRoomsResults from "@/features/chatroom/components/SearchRoomsResults";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useDialog} from "@/components/providers/DialogProvider";
import SearchRoomsMobile from "@/features/chatroom/components/SearchRoomsMobile";
import {Button} from "@/components/ui/button";

const SearchRooms: React.FC = () => {
    const isMobile = useIsMobile();
    const {open, close} = useDialog();

    // Desktop specific state
    const [openPopover, setOpenPopover] = useState(false);

    const {
        searchTerm,
        setSearchTerm,
        rooms,
        searchRoomIsLoading,
        joinRandomRoomIsLoading,
        handleJoinRoom,
        handleJoinRandomRoom,
        handleCreateChatRoom,
        clearSearch,
        showCreateOption,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    } = useRoomSearch();

    useEffect(() => {
        if (!isMobile) {
            setOpenPopover(!!searchTerm.trim());
        }
    }, [searchTerm, isMobile]);

    const handleDesktopJoin = (roomId: number) => {
        handleJoinRoom(roomId);
        setOpenPopover(false);
    };

    const handleDesktopCreate = () => {
        handleCreateChatRoom().then(() => setOpenPopover(false));
    };

    const handleRandomJoin = async () => {
        try {
            await handleJoinRandomRoom();
            setOpenPopover(false);
        } catch {
            // Toast is handled in useRoomSearch.
        }
    };

    const handleMobileClick = () => {
        open(<div className="w-[80vw] md:min-w-[800px] md:max-w-[800px] max-h-[300px] overflow-auto">
            <SearchRoomsMobile onClose={close}/>
        </div>, {className: "glass-popover"});
    };

    if (isMobile) {
        return (
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Search chatrooms"
                    title="Search chatrooms"
                    onClick={handleMobileClick}
                    className="glass-control text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
                >
                    <Search className="h-6 w-6"/>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Join a random chatroom"
                    title="Join a random chatroom"
                    disabled={joinRandomRoomIsLoading}
                    onClick={() => {
                        void handleRandomJoin();
                    }}
                    className="glass-control text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
                >
                    <Shuffle className="h-6 w-6"/>
                </Button>
            </div>
        );
    }

    return (
        <div className="relative w-[400px] max-w-[calc(100vw-7rem)]">
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                    <div className="relative min-w-0 w-full">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-700/90 dark:text-white/90"/>
                        <input
                            type="text"
                            placeholder="Search or create a room…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchTerm.trim()) {
                                    if (rooms.length === 0 && showCreateOption) {
                                        handleDesktopCreate();
                                    } else if (rooms.length > 0) {
                                        handleDesktopJoin(rooms[0].roomId);
                                    }
                                    clearSearch();
                                }
                            }}
                            className="glass-input box-border h-9 min-h-9 w-full rounded-md py-2 pr-10 pl-10 text-sm
                             text-slate-900 placeholder:text-slate-600/80 shadow-sm transition-colors
                             focus:border-ring focus:ring-0 focus:outline-none dark:text-white dark:placeholder:text-white/80"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                    clearSearch();
                                    setOpenPopover(false);
                                }}
                                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4"/>
                            </button>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    side="bottom"
                    className="glass-popover w-[var(--radix-popover-trigger-width)] p-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <SearchRoomsResults
                        isLoading={searchRoomIsLoading}
                        searchTerm={searchTerm}
                        lastSearchedTerm={lastSearchedTerm}
                        validationResult={validationResult as string | true}
                        filteredRooms={rooms}
                        showCreateOption={showCreateOption}
                        joinedRoomIds={joinedRoomIds}
                        user={user}
                        onJoin={handleDesktopJoin}
                        onCreate={handleDesktopCreate}
                    />
                </PopoverContent>
            </Popover>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Join a random chatroom"
                title="Join a random chatroom"
                disabled={joinRandomRoomIsLoading}
                onClick={() => {
                    void handleRandomJoin();
                }}
                className="glass-control absolute top-1/2 left-[calc(100%+0.5rem)] box-border h-9 w-9 -translate-y-1/2 shrink-0 text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
            >
                <Shuffle className="h-4 w-4"/>
            </Button>
        </div>
    );
};

export default SearchRooms;
