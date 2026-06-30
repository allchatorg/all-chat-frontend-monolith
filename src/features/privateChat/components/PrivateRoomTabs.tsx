"use client";

import React, {MouseEvent, useState} from "react";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {Ban, Volume2, VolumeX, X} from "lucide-react";
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
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";

interface PrivateRoomTabsProps {
    tabs: PrivateChatDTO[];
    selectedChatId: number | null;
    onSelect: (conversation: PrivateChatDTO) => void;
    onClose: (roomId: number) => void;
    onReorder?: (tabs: PrivateChatDTO[]) => void;
}

function PrivateRoomTabContent({
                                   conversation,
                                   isSelected,
                                   isSoundOn,
                                   onTabClick,
                                   onCloseClick,
                                   onToggleSound,
                                   style,
                                   isDragging,
                                   innerRef,
                                   attributes,
                                   listeners,
                               }: {
    conversation: PrivateChatDTO;
    isSelected: boolean;
    isSoundOn: boolean;
    onTabClick: () => void;
    onCloseClick: (e: MouseEvent<HTMLButtonElement>) => void;
    onToggleSound: (e: MouseEvent<HTMLButtonElement>) => void;
    style?: React.CSSProperties;
    isDragging?: boolean;
    innerRef?: (node: HTMLElement | null) => void;
    attributes?: any;
    listeners?: any;
}) {
    // Notification sound for inbound messages is fired from PrivateChatsSidebar,
    // which is always mounted on the page and covers every conversation —
    // tabs would double-fire for any conversation that's also open as a tab.

    const tabStateClass = isSelected
        ? "glass-surface-strong room-tab-active text-blue-800 dark:text-emerald-100 font-semibold"
        : "glass-control room-tab-inactive text-slate-700 dark:text-muted-foreground hover:text-blue-800 dark:hover:text-emerald-100";

    const counterpartName = conversation.counterpart?.username ?? "Deleted user";
    const unread = conversation.unreadMessagesCount;

    return (
        <div
            ref={innerRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                mt-4 ml-1 group relative flex flex-col items-center justify-center min-w-0 flex-shrink-0 cursor-grab active:cursor-grabbing
                gap-1 whitespace-nowrap px-4 py-0 transition-all duration-200
                room-tab rounded-t-xl
                ${isDragging ? 'opacity-30' : 'opacity-100'}
                ${tabStateClass}
            `}
            onClick={onTabClick}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onCloseClick(e);
                }}
                className="z-20 border-primary border-[1px] absolute -top-1 -left-1 flex items-center justify-center w-[18px] h-[18px] bg-red-600 text-white hover:bg-red-700 transition-colors rounded-full shadow-md"
                title="Close tab"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <X className="h-3 w-3"/>
            </button>

            <div className="flex max-w-48 items-center gap-2">
                <span className="truncate text-base font-medium" title={counterpartName}>
                    {counterpartName}
                </span>
                {conversation.blocked && (
                    <span title="Blocked" className="inline-flex items-center text-red-500">
                        <Ban className="h-3 w-3"/>
                    </span>
                )}
            </div>

            <div className="flex items-center mt-0.5 cursor-default">
                <div className="flex items-center gap-2 text-xs">
                    {unread === null ? (
                        <span className="h-2 w-2 rounded-full bg-red-500" title="Unread messages"/>
                    ) : unread && unread > 0 ? (
                        <span
                            className="flex h-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white min-w-[1.25rem] px-1.5 py-0.5"
                            title="Unread messages"
                        >
                            {unread}
                        </span>
                    ) : null}
                    <button
                        onClick={onToggleSound}
                        className="rounded-full flex-shrink-0 p-1 transition-colors text-muted-foreground hover:bg-sky-100/35 hover:text-sky-700 dark:hover:bg-white/15 dark:hover:text-white"
                        title={isSoundOn ? "Mute notifications" : "Unmute notifications"}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {isSoundOn ? <Volume2 className="h-3.5 w-3.5"/> : <VolumeX className="h-3.5 w-3.5"/>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PrivateRoomTabItem(props: Parameters<typeof PrivateRoomTabContent>[0]) {
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
        <PrivateRoomTabContent
            {...props}
            innerRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
}

const PrivateRoomTabs: React.FC<PrivateRoomTabsProps> = ({
                                                             tabs,
                                                             selectedChatId,
                                                             onSelect,
                                                             onClose,
                                                             onReorder,
                                                         }) => {
    const {getMuted, toggleSound} = useChatRoomSoundSettings();
    const [activeId, setActiveId] = useState<number | null>(null);

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
            const oldIndex = tabs.findIndex(t => t.id === active.id);
            const newIndex = tabs.findIndex(t => t.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder?.(arrayMove(tabs, oldIndex, newIndex));
            }
        }
        setActiveId(null);
    };

    if (tabs.length === 0) {
        return null;
    }

    const activeConversation = activeId ? tabs.find(t => t.id === activeId) : null;

    return (
        <ScrollArea className="w-[calc(100%+0.25rem)] rounded-t-xl pl-0 pr-1">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tabs.map(t => t.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-1">
                        {tabs.map((conversation) => (
                            <PrivateRoomTabItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={selectedChatId === conversation.id}
                                isSoundOn={!getMuted(conversation.id)}
                                onTabClick={() => onSelect(conversation)}
                                onToggleSound={(e) => {
                                    e.stopPropagation();
                                    toggleSound(conversation.id);
                                }}
                                onCloseClick={(e) => {
                                    e.stopPropagation();
                                    onClose(conversation.id);
                                }}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeConversation ? (
                        <PrivateRoomTabContent
                            conversation={activeConversation}
                            isSelected={selectedChatId === activeConversation.id}
                            isSoundOn={!getMuted(activeConversation.id)}
                            onTabClick={() => {
                            }}
                            onCloseClick={() => {
                            }}
                            onToggleSound={() => {
                            }}
                            style={{cursor: 'grabbing'}}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
            <ScrollBar orientation="horizontal" className=""/>
        </ScrollArea>
    );
};

export default PrivateRoomTabs;
