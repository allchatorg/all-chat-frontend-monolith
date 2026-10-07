import React from "react";
import {useDialog} from "@/components/providers/DialogProvider";
import {useProDialog} from "@/features/pro/useProDialog";
import {useRoomSearch} from "@/features/chatroom/hooks/useRoomSearch";
import SearchRoomsResults from "@/features/chatroom/components/SearchRoomsResults";
import {Search, X} from "lucide-react";
import {Input} from "@/components/ui/input";

interface SearchRoomsMobileProps {
    onClose: () => void;
    initialSearchTerm?: string;
}

export const roomSearchDialogOptions = {
    title: "Search or create a chatroom",
    className: "glass-popover glass-modal-mobile w-[calc(100vw-2rem)] max-w-lg overflow-hidden p-0 [&>button]:right-2 [&>button]:top-2 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg",
};

const SearchRoomsMobile: React.FC<SearchRoomsMobileProps> = ({onClose, initialSearchTerm = ""}) => {
    const {open, close} = useDialog();
    const {
        searchTerm,
        setSearchTerm,
        rooms,
        searchRoomIsLoading,
        handleJoinRoom,
        handleCreateChatRoom,
        clearSearch,
        showCreateOption,
        proOnly, setProOnly, canCreate, proModeLocked, isCreating, creationError,
        validationResult,
        lastSearchedTerm,
        joinedRoomIds,
        user
    } = useRoomSearch(initialSearchTerm);
    const openPro = useProDialog({onBack: () => open(
        <SearchRoomsMobile onClose={close} initialSearchTerm={searchTerm}/>, roomSearchDialogOptions,
    )});
    const handleProOnlyChange = (checked: boolean) => {
        if (checked && !user?.proActive) openPro();
        else setProOnly(checked);
    };

    const onJoin = async (roomId: number) => {
        if (await handleJoinRoom(roomId)) onClose();
    };

    const onCreate = async () => {
        if (proOnly && !user?.proActive) {
            openPro();
            return;
        }
        if (await handleCreateChatRoom()) onClose();
    };

    return (
        <div className="flex max-h-[70dvh] w-full min-w-0 flex-col">
            <div className="border-b py-2 pl-3 pr-14">
                <div className="relative w-full">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-700/90 dark:text-white/90"/>
                    <Input
                        type="text"
                        aria-label="Search or create a room"
                        placeholder="Search or create a room…"
                        value={searchTerm}
                        disabled={isCreating}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="glass-input h-11 w-full pr-11 pl-10 text-base placeholder:text-sm md:text-base lg:text-sm"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            disabled={isCreating}
                            onClick={clearSearch}
                            className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
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
                    onCreate={() => void onCreate()}
                    proOnly={proOnly} onProOnlyChange={handleProOnlyChange} canCreate={canCreate}
                    proModeLocked={proModeLocked} isCreating={isCreating} creationError={creationError}
                />
            </div>
        </div>
    );
};

export default SearchRoomsMobile;
