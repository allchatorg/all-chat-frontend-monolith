import React from "react";
import {User, UserSearch} from "lucide-react";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";

interface SearchUsersResultsProps {
    isLoading: boolean;
    searchTerm: string;
    lastSearchedTerm: string;
    users: UserMinimalDTO[];
    existingConversationCounterpartIds: Set<number>;
    onPickUser: (user: UserMinimalDTO) => void;
}

const SearchUsersResults: React.FC<SearchUsersResultsProps> = ({
                                                                   isLoading,
                                                                   searchTerm,
                                                                   lastSearchedTerm,
                                                                   users,
                                                                   existingConversationCounterpartIds,
                                                                   onPickUser,
                                                               }) => {
    return (
        <div className="p-3">
            {isLoading || (searchTerm.trim() && searchTerm.trim() !== lastSearchedTerm) ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Searching...
                </div>
            ) : users.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto rounded-md border-border">
                    <div className="space-y-1">
                        {users.map((user) => {
                            const hasConversation = existingConversationCounterpartIds.has(user.id);
                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => onPickUser(user)}
                                    className="glass-surface w-full text-left rounded-md p-3 transition-colors hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground"/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-foreground">
                                                {user.username}
                                            </p>
                                            {hasConversation && (
                                                <p className="text-xs text-muted-foreground">
                                                    Open existing conversation
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <UserSearch className="mb-2 h-6 w-6 opacity-50"/>
                    {searchTerm.trim() ? (
                        <>
                            <p>No users found matching "{searchTerm}"</p>
                            <p className="mt-1 text-sm">Try a different name</p>
                        </>
                    ) : (
                        <>
                            <p>Search for a user to start a chat</p>
                            <p className="mt-1 text-sm">Type a username above</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchUsersResults;
