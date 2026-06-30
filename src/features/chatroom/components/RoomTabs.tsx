import React, {useState} from "react";
import {UserChatRoom} from "@/models/UserChatRoom";
import {RoomTabContent, RoomTabItem} from "@/features/chatroom/components/RoomTabItem";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
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
} from "@dnd-kit/sortable";

interface RoomTabsProps {
    rooms: UserChatRoom[],
    selectedUserChatRoom: UserChatRoom | null | undefined,
    onSelectUserChatRoom: (userChatRoom: UserChatRoom) => void,
    onCloseUserChatRoomTab: (userChatRoom: UserChatRoom) => void,
    onOpenCreateRoom?: () => void,
    onReorderRooms?: (rooms: UserChatRoom[]) => void
}

export default function RoomTabs({
                                     rooms,
                                     selectedUserChatRoom,
                                     onSelectUserChatRoom,
                                     onCloseUserChatRoomTab,
                                     onOpenCreateRoom,
                                     onReorderRooms
                                 }: RoomTabsProps) {

    const {getMuted, toggleSound} = useChatRoomSoundSettings();
    const [activeId, setActiveId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const {active} = event;
        setActiveId(active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = rooms.findIndex((room) => room.chatRoomId === active.id);
            const newIndex = rooms.findIndex((room) => room.chatRoomId === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newRooms = arrayMove(rooms, oldIndex, newIndex);
                onReorderRooms?.(newRooms);
            }
        }
        setActiveId(null);
    };

    if (!selectedUserChatRoom) {
        return (
            <div></div>
        );
    }

    const activeRoom = activeId ? rooms.find(r => r.chatRoomId === activeId) : null;

    return (
        <ScrollArea className="w-[calc(100%+0.25rem)] rounded-t-xl pl-0 pr-1">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={rooms.map((r) => r.chatRoomId)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-1">
                        {rooms.map((room, index) => {
                            return (
                                <RoomTabItem
                                    key={room.chatRoomId}
                                    id={selectedUserChatRoom?.chatRoomId}
                                    room={room}
                                    index={index}
                                    isSoundOn={!getMuted(room.chatRoomId)}
                                    onTabClick={() => onSelectUserChatRoom(room)}
                                    onToggleSound={(e) => {
                                        e.stopPropagation();
                                        toggleSound(room.chatRoomId);
                                    }}
                                    onCloseClick={(e) => {
                                        e.stopPropagation();
                                        onCloseUserChatRoomTab(room);
                                    }}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeRoom ? (
                        <RoomTabContent
                            id={selectedUserChatRoom?.chatRoomId}
                            room={activeRoom}
                            isSoundOn={!getMuted(activeRoom.chatRoomId)}
                            onTabClick={() => {
                            }}
                            onCloseClick={() => {
                            }}
                            onToggleSound={() => {
                            }}
                            style={{
                                cursor: 'grabbing',
                            }}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
            <ScrollBar orientation="horizontal" className=""/>
        </ScrollArea>
    );
}
