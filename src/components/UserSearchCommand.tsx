"use client";

import React, {useEffect, useRef, useState} from "react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchUsersThunk} from "@/redux/admin/adminThunk";
import {User} from "@/models/User";
import {UserSearchRequest} from "@/models/UserSearchRequest";
import {cn} from "@/lib/utils";
import {Loader2, User as UserIcon} from "lucide-react";

export type UserSearchCommandProps = {
    onSelectUser: (user: User) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    minQueryLength?: number;
    pageSize?: number;
    className?: string;
};

// Utility to build the default sort string (username asc)
const defaultSort = JSON.stringify([{field: "username", direction: "ASC"}]);

export function UserSearchCommand({
                                      onSelectUser,
                                      open,
                                      onOpenChange,
                                      placeholder = "Search users by username or ID...",
                                      minQueryLength = 2,
                                      pageSize = 10,
                                      className,
                                  }: UserSearchCommandProps) {
    const [runSearch, loading] = useThunk(searchUsersThunk);

    // Local state to manage search results directly
    const [users, setUsers] = useState<User[]>([]);
    const [shouldShowResults, setShouldShowResults] = useState(false);

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);

    // Run search when query changes and meets min length
    useEffect(() => {
        const q = debouncedQuery.trim();

        if (q.length < minQueryLength) {
            setShouldShowResults(false);
            setUsers([]);
            return;
        }

        setShouldShowResults(true);
        const params: UserSearchRequest = {
            usernameOrId: q,
            page: 0,
            size: pageSize,
            sort: defaultSort,
        };

        // Run search and handle the result directly
        runSearch(params).then((result) => {
            if (result && result.content) {
                setUsers(result.content);
            } else {
                setUsers([]);
            }
        }).catch(() => {
            setUsers([]);
        });
    }, [debouncedQuery, minQueryLength, pageSize, runSearch]);

    const handleSelect = (value: string) => {
        const id = Number(value);
        const user = users.find(u => u.id === id);
        if (user) {
            onSelectUser(user);
            if (onOpenChange) onOpenChange(false);
        }
    };

    const body = (
        <Command shouldFilter={false} className={cn("w-full", className)}>
            <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder={placeholder}
            />
            <CommandList>
                {loading && (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin"/> Searching...
                    </div>
                )}
                {!loading && shouldShowResults && users.length === 0 && (
                    <CommandEmpty>No users found.</CommandEmpty>
                )}
                {shouldShowResults && users.length > 0 && (
                    <>
                        <CommandGroup heading="Users">
                            {users.map((user) => (
                                <CommandItem key={user.id} value={String(user.id)} onSelect={handleSelect}>
                                    <UserIcon className="mr-2 h-4 w-4"/>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.username}</span>
                                        <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator/>
                    </>
                )}
            </CommandList>
        </Command>
    );

    // Dialog mode if open prop is controlled
    if (typeof open === "boolean" && onOpenChange) {
        return (
            <CommandDialog open={open} onOpenChange={onOpenChange}>
                {body}
            </CommandDialog>
        );
    }

    // Inline mode
    return body;
}

function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            setDebounced(value);
            return;
        }
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}

export default UserSearchCommand;