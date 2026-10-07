"use client";

import React, {useEffect, useRef, useState} from "react";
import {Search, Shuffle, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useRoomSearch} from "@/features/chatroom/hooks/useRoomSearch";
import SearchRoomsResults from "@/features/chatroom/components/SearchRoomsResults";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useDialog} from "@/components/providers/DialogProvider";
import {useProDialog} from "@/features/pro/useProDialog";
import SearchRoomsMobile, {roomSearchDialogOptions} from "@/features/chatroom/components/SearchRoomsMobile";
import {Button} from "@/components/ui/button";

const SearchRooms: React.FC = () => {
    const isMobile = useIsMobile();
    const {open, close} = useDialog();

    // Desktop specific state
    const [openPopover, setOpenPopover] = useState(false);
    const upgradingRef = useRef(false);

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
        proOnly, setProOnly, canCreate, selectedModeExists, isCreating, creationError,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    } = useRoomSearch();

    const openPro = useProDialog({onBack: () => {close(); setOpenPopover(true);}});
    const handleProOnlyChange = (checked: boolean) => {
        if (checked && !user?.proActive) {
            upgradingRef.current = true;
            setOpenPopover(false);
            openPro();
        } else setProOnly(checked);
    };

    useEffect(() => {
        setOpenPopover(!isMobile && !!searchTerm.trim());
    }, [searchTerm, isMobile]);

    const handleDesktopJoin = async (roomId: number) => {
        if (await handleJoinRoom(roomId)) setOpenPopover(false);
    };

    const handleDesktopCreate = async () => {
        if (await handleCreateChatRoom()) setOpenPopover(false);
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
        open(<SearchRoomsMobile onClose={close}/>, roomSearchDialogOptions);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Search chatrooms"
                title="Search chatrooms"
                onClick={handleMobileClick}
                className="glass-control h-10 w-10 shrink-0 lg:hidden text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
            >
                <Search className="h-6 w-6"/>
            </Button>
            {/* Balance the shuffle button and gap so the desktop input stays centered. */}
            <div className="hidden min-w-0 w-full items-center gap-2 pl-11 lg:flex">
                <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger asChild>
                        <div className="relative min-w-0 flex-1">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-700/90 dark:text-white/90"/>
                            <input
                                type="text"
                                aria-label="Search or create a room"
                                placeholder="Search or create a room…"
                                value={searchTerm}
                                disabled={isCreating}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchTerm.trim()) {
                                        e.preventDefault();
                                        // Wait for results for this query, including the debounce delay.
                                        if (searchRoomIsLoading || lastSearchedTerm !== searchTerm.trim()) {
                                            setOpenPopover(true);
                                            return;
                                        }
                                        const exactRooms = rooms.filter(room => room.roomName.trim().toLowerCase() === searchTerm.trim().toLowerCase());
                                        if (canCreate) {
                                            void handleDesktopCreate();
                                        } else if (exactRooms.length > 1) {
                                            // Same-name variants must be chosen explicitly from the badged results.
                                            setOpenPopover(true);
                                        } else if (exactRooms.length === 1) {
                                            void handleDesktopJoin(exactRooms[0].roomId);
                                        } else if (rooms.length > 0) {
                                            void handleDesktopJoin(rooms[0].roomId);
                                        }
                                    }
                                }}
                                className="glass-input box-border h-9 min-h-9 w-full rounded-md py-2 pr-10 pl-10 text-sm
                                 text-slate-900 placeholder:text-slate-600/80 shadow-xs transition-colors
                                 focus:border-ring focus:ring-0 focus:outline-hidden dark:text-white dark:placeholder:text-white/80"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    disabled={isCreating}
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
                        className="glass-popover w-(--radix-popover-trigger-width) p-0"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => {
                            if (upgradingRef.current) e.preventDefault();
                            upgradingRef.current = false;
                        }}
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
                            onCreate={() => void handleDesktopCreate()}
                            proOnly={proOnly} onProOnlyChange={handleProOnlyChange} canCreate={canCreate}
                            selectedModeExists={selectedModeExists} isCreating={isCreating} creationError={creationError}
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
                    className="glass-control box-border h-9 w-9 shrink-0 text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
                >
                    <Shuffle className="h-4 w-4"/>
                </Button>
            </div>
        </>
    );
};

export default SearchRooms;
