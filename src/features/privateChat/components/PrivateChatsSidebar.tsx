"use client";

import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Ban, Loader2, MessageCircleX, MoreVertical, User as UserIcon, Volume2, VolumeX, X} from "lucide-react";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";
import {useNotificationSounds} from "@/lib/hooks/useNotificationSounds";
import {useUser} from "@/lib/hooks/useUser";

interface PrivateChatsSidebarProps {
    conversations: PrivateChatDTO[];
    selectedChatId: number | null;
    isLoading: boolean;
    onSelect: (conversation: PrivateChatDTO) => void;
    onHide: (roomId: number) => void;
    onReorder?: (conversations: PrivateChatDTO[]) => void;
    onCloseSidebar?: () => void;
    showCloseButton?: boolean;
}

function ConversationRowContent({
                                    conversation,
                                    isActive,
                                    isMuted,
                                    onRowClick,
                                    onToggleSound,
                                    onHide,
                                    style,
                                    isDragging,
                                    isOverlay,
                                    innerRef,
                                    attributes,
                                    listeners,
                                }: {
    conversation: PrivateChatDTO;
    isActive: boolean;
    isMuted: boolean;
    onRowClick: () => void;
    onToggleSound: (e: MouseEvent<HTMLButtonElement>) => void;
    onHide: () => void;
    style?: React.CSSProperties;
    isDragging?: boolean;
    isOverlay?: boolean;
    innerRef?: (node: HTMLElement | null) => void;
    attributes?: any;
    listeners?: any;
}) {
    const unread = conversation.unreadMessagesCount;
    const counterpartName = conversation.counterpart?.username ?? "Deleted user";
    const lastMessagePreview = conversation.lastMessage?.content?.trim() || "";

    return (
        <div
            ref={innerRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none touch-manipulation ${
                isDragging ? "opacity-30" : ""
            } ${
                isOverlay
                    ? "glass-surface-strong rounded-md shadow-lg cursor-grabbing"
                    : isActive
                        ? "bg-white/10 dark:bg-white/15"
                        : "hover:bg-white/5"
            }`}
            onClick={onRowClick}
        >
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserIcon className="h-4 w-4 text-muted-foreground"/>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">
                        {counterpartName}
                    </span>
                    {conversation.blocked && (
                        <span title="Blocked"
                              className="inline-flex items-center text-red-500">
                            <Ban className="h-3 w-3"/>
                        </span>
                    )}
                </div>
                {lastMessagePreview && (
                    <p className="truncate text-xs text-muted-foreground">
                        {lastMessagePreview}
                    </p>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
                {unread === null ? (
                    <span
                        className="h-2 w-2 rounded-full bg-red-500"
                        title="Unread messages"
                    />
                ) : unread > 0 ? (
                    <span
                        className="flex h-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white min-w-5 px-1.5 py-0.5"
                        title="Unread messages"
                    >
                        {unread}
                    </span>
                ) : null}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSound(e);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="rounded-full p-1 transition-colors text-muted-foreground hover:bg-sky-100/35 hover:text-sky-700 dark:hover:bg-white/15 dark:hover:text-white"
                    title={isMuted ? "Unmute notifications" : "Mute notifications"}
                    aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
                >
                    {isMuted
                        ? <VolumeX className="h-3.5 w-3.5"/>
                        : <Volume2 className="h-3.5 w-3.5"/>}
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Conversation options"
                        >
                            <MoreVertical className="h-3.5 w-3.5"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-popover">
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                            onSelect={onHide}
                        >
                            Hide conversation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function SortableConversationRow(props: Parameters<typeof ConversationRowContent>[0]) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: props.conversation.id});

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <ConversationRowContent
            {...props}
            innerRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
}

const PrivateChatsSidebar: React.FC<PrivateChatsSidebarProps> = ({
                                                                     conversations,
                                                                     selectedChatId,
                                                                     isLoading,
                                                                     onSelect,
                                                                     onHide,
                                                                     onReorder,
                                                                     onCloseSidebar,
                                                                     showCloseButton,
                                                                 }) => {
    const {getMuted, toggleSound} = useChatRoomSoundSettings();
    const {playPrivateNotificationSound} = useNotificationSounds();
    const {user} = useUser();
    const [activeId, setActiveId] = useState<number | null>(null);
    // Swallows the click that fires right after a completed drag so it doesn't
    // select the dragged conversation (and close the sidebar sheet on mobile).
    const justDraggedRef = useRef(false);

    // Same activation constraints as the room tabs: mouse needs 10px of
    // movement, touch needs a 250ms press-and-hold so taps and scrolling on
    // mobile are unaffected.
    const sensors = useSensors(
        useSensor(MouseSensor, {activationConstraint: {distance: 10}}),
        useSensor(TouchSensor, {activationConstraint: {delay: 250, tolerance: 5}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = conversations.findIndex(c => c.id === active.id);
            const newIndex = conversations.findIndex(c => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder?.(arrayMove(conversations, oldIndex, newIndex));
            }
        }
        justDraggedRef.current = true;
        setTimeout(() => {
            justDraggedRef.current = false;
        }, 0);
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Fire a notification sound when any unmuted conversation's lastMessage advances.
    const previousLastMessageIdsRef = useRef<Record<number, number>>({});
    useEffect(() => {
        if (!user) return;
        const next: Record<number, number> = {};
        for (const conv of conversations) {
            const lastId = conv.lastMessage?.id ?? 0;
            next[conv.id] = lastId;
            const prevId = previousLastMessageIdsRef.current[conv.id];
            if (prevId !== undefined && lastId > prevId && !getMuted(conv.id)) {
                const isOwn = conv.lastMessage?.senderId === user.id;
                playPrivateNotificationSound(isOwn);
            }
        }
        previousLastMessageIdsRef.current = next;
    }, [conversations, user, getMuted, playPrivateNotificationSound]);

    const activeConversation = activeId
        ? conversations.find(c => c.id === activeId) ?? null
        : null;

    return (
        <div className="flex h-full w-full flex-col">
            <div
                className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                    Conversations
                </h2>
                {showCloseButton && onCloseSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="glass-control h-8 w-8"
                        aria-label="Close sidebar"
                        onClick={onCloseSidebar}
                    >
                        <X className="h-4 w-4"/>
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                {isLoading && conversations.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Loading…
                    </div>
                ) : conversations.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center px-4 py-10 text-center text-muted-foreground">
                        <MessageCircleX className="mb-2 h-6 w-6 opacity-50"/>
                        <p className="text-sm">No conversations yet.</p>
                        <p className="mt-1 text-xs">Search for a user in the navbar to start one.</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                    >
                        <SortableContext
                            items={conversations.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="py-1">
                                {conversations.map((conversation) => (
                                    <li key={conversation.id}>
                                        <SortableConversationRow
                                            conversation={conversation}
                                            isActive={conversation.id === selectedChatId}
                                            isMuted={getMuted(conversation.id)}
                                            onRowClick={() => {
                                                if (justDraggedRef.current) return;
                                                onSelect(conversation);
                                            }}
                                            onToggleSound={() => toggleSound(conversation.id)}
                                            onHide={() => onHide(conversation.id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </SortableContext>
                        <DragOverlay>
                            {activeConversation ? (
                                <ConversationRowContent
                                    conversation={activeConversation}
                                    isActive={activeConversation.id === selectedChatId}
                                    isMuted={getMuted(activeConversation.id)}
                                    onRowClick={() => {
                                    }}
                                    onToggleSound={() => {
                                    }}
                                    onHide={() => {
                                    }}
                                    isOverlay
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </ScrollArea>
        </div>
    );
};

export default PrivateChatsSidebar;
