"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Search, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useUserSearch} from "@/features/privateChat/hooks/useUserSearch";
import SearchUsersResults from "@/features/privateChat/components/SearchUsersResults";
import SearchUsersMobile from "@/features/privateChat/components/SearchUsersMobile";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useDialog} from "@/components/providers/DialogProvider";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {openOrCreateAndSelectPrivateChatThunk} from "@/redux/privateChat/privateChatThunk";
import {selectPrivateConversations} from "@/redux/privateChat/privateChatSelectors";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {ROUTES} from "@/routes";
import {toast} from "sonner";

const SearchUsers: React.FC = () => {
    const isMobile = useIsMobile();
    const {open, close} = useDialog();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const conversations = useSelector(selectPrivateConversations);
    const [openPopover, setOpenPopover] = useState(false);

    const {searchTerm, setSearchTerm, users, isLoading, lastSearchedTerm, clearSearch} = useUserSearch();

    const existingCounterpartIds = useMemo(
        () => new Set(conversations.map(c => c.counterpart?.id).filter((id): id is number => typeof id === "number")),
        [conversations]
    );

    useEffect(() => {
        if (!isMobile) {
            setOpenPopover(!!searchTerm.trim());
        }
    }, [searchTerm, isMobile]);

    const handlePickUser = async (user: UserMinimalDTO) => {
        try {
            const conversation = await dispatch(openOrCreateAndSelectPrivateChatThunk(user.id)).unwrap();
            clearSearch();
            setOpenPopover(false);
            router.push(`${ROUTES.PRIVATE_CHAT}?chatRoomId=${conversation.id}`);
        } catch (err: any) {
            if (err?.status === 400) {
                toast.error(err?.message || "User not available.");
            } else if (err?.status === 403) {
                toast.error("You can't message this user.");
            } else {
                toast.error(err?.message || "Failed to open conversation.");
            }
        }
    };

    const handleMobileClick = () => {
        open(
            <div className="w-[80vw] md:min-w-[800px] md:max-w-[800px] max-h-[300px] overflow-auto">
                <SearchUsersMobile onClose={close}/>
            </div>,
            {className: "glass-popover"}
        );
    };

    if (isMobile) {
        return (
            <Button
                variant="ghost"
                size="icon"
                aria-label="Search users"
                title="Search users"
                onClick={handleMobileClick}
                className="glass-control text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-white"
            >
                <Search className="h-6 w-6"/>
            </Button>
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
                            placeholder="Search users to message…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchTerm.trim() && users.length > 0) {
                                    handlePickUser(users[0]);
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
                    <SearchUsersResults
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        lastSearchedTerm={lastSearchedTerm}
                        users={users}
                        existingConversationCounterpartIds={existingCounterpartIds}
                        onPickUser={handlePickUser}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default SearchUsers;
