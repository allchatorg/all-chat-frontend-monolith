"use client";

import React, {useState} from "react";
import {Paperclip, Search, X} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchPrivateChatMessagesThunk} from "@/redux/privateChat/privateChatThunk";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {
    selectPrivateSearchMessagesParams,
    selectSelectedPrivateChatId,
} from "@/redux/privateChat/privateChatSelectors";
import {setSearchPrivateMessagesParams} from "@/redux/privateChat/privateChatSlice";
import {setPrivateActiveRightPanel} from "@/redux/privateChat/privateChatUiSlice";

const PAGE_SIZE = 10;

type SearchFilter = { type: "fname"; value: string };

const PrivateChatSearchBar: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchMessages] = useThunk(searchPrivateChatMessagesThunk);
    const selectedChatId = useSelector(selectSelectedPrivateChatId);
    const searchParams = useSelector(selectPrivateSearchMessagesParams);

    const [filters, setFilters] = useState<SearchFilter[]>(
        searchParams?.attachmentName ? [{type: "fname", value: searchParams.attachmentName}] : []
    );
    const [inputValue, setInputValue] = useState(searchParams?.content ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const createSearchRequest = (
        overrideContent?: string,
        overrideFilters?: SearchFilter[]
    ): SearchMessageRequest => {
        const filtersToUse = overrideFilters ?? filters;
        const contentToUse = overrideContent !== undefined ? overrideContent : inputValue.trim();
        const fnameFilter = filtersToUse.find(f => f.type === "fname");

        return {
            content: contentToUse,
            attachmentName: fnameFilter?.value,
            page: 0,
            size: PAGE_SIZE,
        };
    };

    const performSearch = (overrideContent?: string, overrideFilters?: SearchFilter[]) => {
        dispatch(setPrivateActiveRightPanel("search-messages"));
        if (!selectedChatId) return;
        const request = createSearchRequest(overrideContent, overrideFilters);
        dispatch(setSearchPrivateMessagesParams(request));
        searchMessages({roomId: selectedChatId, request});
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && (inputValue.trim() || filters.length > 0)) {
            e.preventDefault();

            const trimmed = inputValue.trim();

            // Filter only, e.g. "fname:report.pdf"
            const fnameMatch = trimmed.match(/^fname:(\S+)$/);
            if (fnameMatch) {
                const newFilters: SearchFilter[] = [...filters.filter(f => f.type !== "fname"), {
                    type: "fname",
                    value: fnameMatch[1],
                }];
                performSearch("", newFilters);
                setFilters(newFilters);
                setInputValue("");
                return;
            }

            // Text followed by a filter, e.g. "some text fname:report.pdf"
            const trailingFnameMatch = trimmed.match(/^(.*?)\s+fname:(\S+)$/);
            if (trailingFnameMatch) {
                const newFilters: SearchFilter[] = [...filters.filter(f => f.type !== "fname"), {
                    type: "fname",
                    value: trailingFnameMatch[2],
                }];
                const newContent = trailingFnameMatch[1];
                performSearch(newContent, newFilters);
                setFilters(newFilters);
                setInputValue(newContent);
                return;
            }

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
            const fnameMatch = trimmed.match(/^fname:(\S+)$/);
            if (fnameMatch) {
                setFilters(prev => [...prev.filter(f => f.type !== "fname"), {type: "fname", value: fnameMatch[1]}]);
                setInputValue("");
            }
        }
    };

    const removeFilter = (type: "fname") => {
        setFilters(prev => prev.filter(f => f.type !== type));
    };

    const handleClear = () => {
        setInputValue("");
        setFilters([]);
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="relative text-sm w-full">
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={`glass-input flex flex-wrap md:min-w-[260px] items-center gap-2 w-full px-3 py-2 rounded-md transition-colors ${
                    isFocused ? "ring-1 ring-ring border-transparent" : ""
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
                    placeholder={filters.length === 0 ? "Search messages..." : ""}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    className="flex-1 min-w-[80px] bg-transparent outline-hidden placeholder:text-muted-foreground text-base sm:text-sm"
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

export default PrivateChatSearchBar;
