"use client";

import React from "react";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Ban, ChevronLeft, ChevronRight, Loader2, MessagesSquare, Search} from "lucide-react";
import {cn} from "@/lib/utils";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";

interface AdminConversationListProps {
    conversations: AdminConversationDTO[];
    selectedRoomId: number | null;
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelect: (roomId: number) => void;
    totalPages: number;
    currentPage: number; // zero-based
    onPageChange: (page: number) => void;
}

const formatTimestamp = (value: string | null): string => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    return sameDay
        ? date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        : date.toLocaleDateString([], {month: "short", day: "numeric"});
};

const previewText = (conversation: AdminConversationDTO): string => {
    const last = conversation.lastMessage;
    if (!last) return "No messages";
    if (last.deleted) return "Message deleted";
    if (last.content && last.content.trim().length > 0) return last.content;
    if (last.attachments && last.attachments.length > 0) return "Attachment";
    return "…";
};

const AdminConversationList: React.FC<AdminConversationListProps> = ({
                                                                         conversations,
                                                                         selectedRoomId,
                                                                         isLoading,
                                                                         searchTerm,
                                                                         onSearchChange,
                                                                         onSelect,
                                                                         totalPages,
                                                                         currentPage,
                                                                         onPageChange,
                                                                     }) => {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="relative mb-3 shrink-0">
                <Search
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"/>
                <Input
                    placeholder="Search by participant username"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <ScrollArea className="min-h-0 flex-1 rounded-lg">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    </div>
                ) : conversations.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                        <MessagesSquare className="h-6 w-6"/>
                        <span>No conversations to display</span>
                    </div>
                ) : (
                    <ul className="space-y-1 pr-2">
                        {conversations.map((conversation) => {
                            const counterpartName = conversation.counterpart?.username ?? "Deleted user";
                            const isSelected = conversation.roomId === selectedRoomId;
                            return (
                                <li key={conversation.roomId}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(conversation.roomId)}
                                        className={cn(
                                            "glass-control flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left transition-colors",
                                            isSelected
                                                ? "bg-primary/10 ring-1 ring-primary/40"
                                                : "hover:bg-white/20 dark:hover:bg-white/10",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-medium">@{counterpartName}</span>
                                            {conversation.blocked && (
                                                <Ban className="h-3.5 w-3.5 shrink-0 text-red-500"/>
                                            )}
                                            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                                                {formatTimestamp(conversation.lastMessageAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate text-xs text-muted-foreground">
                                                {previewText(conversation)}
                                            </span>
                                            <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                                                {conversation.totalMessageCount}
                                            </Badge>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </ScrollArea>

            {totalPages > 1 && (
                <div className="mt-2 flex shrink-0 items-center justify-between gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="glass-control"
                        disabled={currentPage <= 0 || isLoading}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="glass-control"
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdminConversationList;
