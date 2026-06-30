"use client";

import React, {useMemo} from "react";
import {useRouter} from "next/navigation";
import {Search, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useUserSearch} from "@/features/privateChat/hooks/useUserSearch";
import SearchUsersResults from "@/features/privateChat/components/SearchUsersResults";
import {useDispatch, useSelector} from "react-redux";
import {selectPrivateConversations} from "@/redux/privateChat/privateChatSelectors";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {AppDispatch} from "@/redux/store";
import {openOrCreateAndSelectPrivateChatThunk} from "@/redux/privateChat/privateChatThunk";
import {ROUTES} from "@/routes";
import {toast} from "sonner";

interface SearchUsersMobileProps {
    onClose: () => void;
}

const SearchUsersMobile: React.FC<SearchUsersMobileProps> = ({onClose}) => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const conversations = useSelector(selectPrivateConversations);
    const {searchTerm, setSearchTerm, users, isLoading, lastSearchedTerm, clearSearch} = useUserSearch();

    const existingCounterpartIds = useMemo(
        () => new Set(conversations.map(c => c.counterpart?.id).filter((id): id is number => typeof id === "number")),
        [conversations]
    );

    const handlePickUser = async (user: UserMinimalDTO) => {
        try {
            const conversation = await dispatch(openOrCreateAndSelectPrivateChatThunk(user.id)).unwrap();
            clearSearch();
            onClose();
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

    return (
        <div className="w-full flex flex-col md:h-[500px]">
            <div className="px-4 py-2 border-b">
                <div className="relative w-full">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-700/90 dark:text-white/90"/>
                    <Input
                        type="text"
                        placeholder="Search users…"
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
                <SearchUsersResults
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    lastSearchedTerm={lastSearchedTerm}
                    users={users}
                    existingConversationCounterpartIds={existingCounterpartIds}
                    onPickUser={handlePickUser}
                />
            </div>
        </div>
    );
};

export default SearchUsersMobile;
