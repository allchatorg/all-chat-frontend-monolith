"use client";

import React, {useState} from "react";
import {Paperclip, Search, X} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {selectActiveRightPanel} from "@/redux/settings/settingsSelector";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchChatRoomMessagesThunk} from "@/redux/chatRoom/chatRoomThunk";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {setSearchMessagesParams} from "@/redux/chatRoom/chatRoomSlice";

interface ParsedSearch {
    senderUsername?: string;
    content: string;
    attachmentName?: string;
}

interface ChatSearchBarProps {
    // When provided, the bar delegates the built request to this callback instead of
    // driving the chatroom search (used by the admin conversation search).
    onSearch?: (request: SearchMessageRequest) => void;
    placeholder?: string;
    // Which filter pills are offered. Defaults to both; the admin 1-on-1 view passes ['fname']
    // since "from:" is meaningless in a two-person conversation.
    enabledFilters?: Array<'from' | 'fname'>;
}

const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
                                                         onSearch,
                                                         placeholder,
                                                         enabledFilters = ['from', 'fname'],
                                                     }) => {
    const dispatch = useDispatch();
    const [searchMessages, searchIsLoading, searchError] = useThunk(searchChatRoomMessagesThunk);
    const selectedChatroom = useSelector(selectSelectedChatRoomState);
    const activeRightPanel = useSelector(selectActiveRightPanel);

    const fromEnabled = enabledFilters.includes('from');
    const fnameEnabled = enabledFilters.includes('fname');

    const [filters, setFilters] = useState<{ type: 'from' | 'fname', value: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const showPopup = isFocused && inputValue === "" && filters.length === 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && (inputValue.trim() || filters.length > 0)) {
            e.preventDefault();

            // Parse any filters in the input value before searching
            const trimmed = inputValue.trim();

            // Check for filter only (e.g., "from:username")
            const fromMatch = fromEnabled ? trimmed.match(/^from:(\S+)$/) : null;
            if (fromMatch) {
                const newFilters = [...filters.filter(f => f.type !== 'from'), {
                    type: 'from' as const,
                    value: fromMatch[1]
                }];
                // Execute search immediately with the new filter
                performSearch("", newFilters);
                // Update UI state
                setFilters(newFilters);
                setInputValue("");
                return;
            }

            const fnameMatch = fnameEnabled ? trimmed.match(/^fname:(\S+)$/) : null;
            if (fnameMatch) {
                const newFilters = [...filters.filter(f => f.type !== 'fname'), {
                    type: 'fname' as const,
                    value: fnameMatch[1]
                }];
                // Execute search immediately with the new filter
                performSearch("", newFilters);
                // Update UI state
                setFilters(newFilters);
                setInputValue("");
                return;
            }

            // Check for text followed by filter (e.g., "some text from:user")
            const trailingFromMatch = fromEnabled ? trimmed.match(/^(.*?)\s+from:(\S+)$/) : null;
            if (trailingFromMatch) {
                const newFilters = [...filters.filter(f => f.type !== 'from'), {
                    type: 'from' as const,
                    value: trailingFromMatch[2]
                }];
                const newContent = trailingFromMatch[1];
                // Execute search immediately with the new filter and content
                performSearch(newContent, newFilters);
                // Update UI state
                setFilters(newFilters);
                setInputValue(newContent);
                return;
            }

            const trailingFnameMatch = fnameEnabled ? trimmed.match(/^(.*?)\s+fname:(\S+)$/) : null;
            if (trailingFnameMatch) {
                const newFilters = [...filters.filter(f => f.type !== 'fname'), {
                    type: 'fname' as const,
                    value: trailingFnameMatch[2]
                }];
                const newContent = trailingFnameMatch[1];
                // Execute search immediately with the new filter and content
                performSearch(newContent, newFilters);
                // Update UI state
                setFilters(newFilters);
                setInputValue(newContent);
                return;
            }

            // No filter detected, perform search with current state
            performSearch();
        } else if (e.key === "Backspace" && inputValue === "" && filters.length > 0) {
            setFilters(prev => prev.slice(0, -1));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.endsWith(" ")) {
            const trimmed = value.trim();
            const fromMatch = fromEnabled ? trimmed.match(/^from:(\S+)$/) : null;
            if (fromMatch) {
                setFilters(prev => [...prev.filter(f => f.type !== 'from'), {type: 'from', value: fromMatch[1]}]);
                setInputValue("");
                return;
            }
            const fnameMatch = fnameEnabled ? trimmed.match(/^fname:(\S+)$/) : null;
            if (fnameMatch) {
                setFilters(prev => [...prev.filter(f => f.type !== 'fname'), {type: 'fname', value: fnameMatch[1]}]);
                setInputValue("");
                return;
            }
        }
    };

    const removeFilter = (type: 'from' | 'fname') => {
        setFilters(prev => prev.filter(f => f.type !== type));
    };

    const performSearch = (overrideContent?: string, overrideFilters?: { type: 'from' | 'fname', value: string }[]) => {
        const request = createSearchRequest(overrideContent, overrideFilters);

        if (onSearch) {
            onSearch(request);
            return;
        }

        dispatch(setActiveRightSidebar("search-chatroom-messages"));
        if (selectedChatroom?.id) {
            searchMessages({
                roomId: selectedChatroom.id,
                request,
            });
            dispatch(setSearchMessagesParams(request));
        }
    };

    const handleClear = () => {
        setInputValue("");
        setFilters([]);
    };

    const createSearchRequest = (overrideContent?: string, overrideFilters?: {
        type: 'from' | 'fname',
        value: string
    }[]): SearchMessageRequest => {
        const filtersToUse = overrideFilters ?? filters;
        const contentToUse = overrideContent !== undefined ? overrideContent : inputValue.trim();

        const fromFilter = filtersToUse.find(f => f.type === 'from');
        const fnameFilter = filtersToUse.find(f => f.type === 'fname');

        return {
            content: contentToUse,
            senderUsername: fromFilter?.value,
            attachmentName: fnameFilter?.value,
            page: 0,
            size: 10,
        };
    };

    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="relative text-sm w-full">
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={`glass-input flex flex-wrap md:min-w-[260px] items-center gap-2 w-full px-3 py-2 rounded-md transition-colors ${isFocused ? 'ring-1 ring-ring border-transparent' : ''
                }`}
            >
                <Search className="h-4 w-4 text-muted-foreground shrink-0"/>

                {filters.map((filter, index) => (
                    <span
                        key={filter.type + index}
                        className="glass-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white animate-in fade-in zoom-in duration-200"
                    >
                        <span className="font-semibold">{filter.type}:</span> {filter.value}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFilter(filter.type);
                            }}
                            className="ml-1 hover:text-white"
                        >
                            <X className="h-3 w-3"/>
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={filters.length === 0 ? (placeholder ?? "Search messages...") : ""}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground text-base sm:text-sm"
                />

                {(inputValue || filters.length > 0) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                )}
            </div>

            {isFocused && (
                <div
                    className="glass-popover glass-popover-strong absolute top-full left-0 right-0 mt-2 z-50 rounded-md text-popover-foreground animate-in fade-in slide-in-from-top-2 duration-200 p-2">
                    <div className="p-2">
                        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search
                            Filters</h4>
                        <div className="space-y-1">
                            {fromEnabled && (
                                <div
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-white/35 dark:hover:bg-white/10 cursor-pointer transition-colors"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setInputValue(prev => prev + "from:");
                                        inputRef.current?.focus();
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                                        <Search className="h-4 w-4 shrink-0"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">from:user</span>
                                        <span
                                            className="text-xs text-muted-foreground">Messages from a specific user</span>
                                    </div>
                                </div>
                            )}

                            {fnameEnabled && (
                                <div
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-white/35 dark:hover:bg-white/10 cursor-pointer transition-colors"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setInputValue(prev => prev + "fname:");
                                        inputRef.current?.focus();
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                                        <Paperclip className="h-4 w-4 shrink-0"/>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">fname:filename</span>
                                        <span
                                            className="text-xs text-muted-foreground">Messages with a specific attachment</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="glass-surface p-2 rounded-b-md border-t mt-1">
                        <p className="text-xs text-muted-foreground">
                            Type <kbd
                            className="glass-pill pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span
                            className="text-xs">Enter</span></kbd> to search, or Space to apply filter
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSearchBar;
