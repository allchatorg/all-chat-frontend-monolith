import {UserChatRoom} from "@/models/UserChatRoom";
import {Archive, MessageSquare, UserCheck, Volume2, VolumeX, X} from "lucide-react";
import {MouseEvent, useEffect, useRef} from "react";
import {useUser} from "@/lib/hooks/useUser";
import {useNotificationSounds} from "@/lib/hooks/useNotificationSounds";
import {getRoleLevel, Role} from "@/models/Role";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Badge} from "@/components/ui/badge";
import {getMessageCategory} from "@/lib/utils";
import {isBugReportsChatRoomName} from "@/lib/chatRooms";

// The pure visual component (no sorting logic)
export function RoomTabContent({
                                   id,
                                   room,
                                   isSoundOn,
                                   onTabClick,
                                   onCloseClick,
                                   onToggleSound,
                                   style,
                                   isDragging,
                                   innerRef,
                                   attributes,
                                   listeners
                               }: {
    id: number | undefined;
    room: UserChatRoom;
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
    const previousMessageRef = useRef<typeof room.lastMessage>(null);
    const {user} = useUser();
    const {playNotificationSound} = useNotificationSounds();
    const isStaffRoom = getRoleLevel(room.chatRoomRequiredAccessLevel) > getRoleLevel(Role.GUEST);
    const isBugReportsRoom = isBugReportsChatRoomName(room.chatRoomName);
    const isArchived = room.roomPopulation.archived;

    const getNoiseIndicator = (level: ChatRoomNoiseLevelEnum) => {
        switch (level) {
            case ChatRoomNoiseLevelEnum.QUIET:
                return {letter: "Q", color: "text-red-500", title: "Quiet (low activity)"};
            case ChatRoomNoiseLevelEnum.CONVERSATIONAL:
                return {letter: "C", color: "text-green-600", title: "Conversational (healthy activity)"};
            case ChatRoomNoiseLevelEnum.NOISY:
                return {letter: "N", color: "text-red-600 dark:text-red-400", title: "Noisy (high activity)"};
            default:
                return {letter: "?", color: "text-gray-500 dark:text-gray-400", title: "Unknown activity level"};
        }
    };

    const noise = getNoiseIndicator(room.roomPopulation.noiseLevel);
    const archivedAccentClass = isArchived
        ? "ring-1 ring-inset ring-amber-300/80 dark:ring-0 dark:border-amber-700/70"
        : "";
    const tabAccentClass = isBugReportsRoom
        ? "room-tab-bug"
        : isStaffRoom
            ? "room-tab-staff"
            : "";
    const tabStateClass = (() => {
        if (id === room.chatRoomId) {
            if (isBugReportsRoom) {
                return "glass-surface-strong room-tab-active text-rose-700 dark:text-rose-300 font-semibold";
            }

            if (isStaffRoom) {
                return "glass-surface-strong room-tab-active text-purple-700 dark:text-purple-300 font-semibold";
            }

            return "glass-surface-strong room-tab-active text-blue-800 dark:text-emerald-100 font-semibold";
        }

        if (isBugReportsRoom) {
            return "glass-control room-tab-inactive text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200";
        }

        if (isStaffRoom) {
            return "glass-control room-tab-inactive text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200";
        }

        return "glass-control room-tab-inactive text-slate-700 dark:text-muted-foreground hover:text-blue-800 dark:hover:text-emerald-100";
    })();

    useEffect(() => {
        if (!isSoundOn || !user) return;

        const currentMessage = room.lastMessage;
        const previousMessage = previousMessageRef.current;

        const isNewerMessage =
            currentMessage &&
            previousMessage &&
            currentMessage.id > previousMessage.id;

        if (isNewerMessage) {
            const isOwnMessage = currentMessage.senderId === user.id;
            playNotificationSound(isOwnMessage);
        }

        previousMessageRef.current = currentMessage;
    }, [room.lastMessage, isSoundOn, user]);

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
                ${tabAccentClass}
                ${tabStateClass}
                ${archivedAccentClass}
            `}
            onClick={onTabClick}
        >
            {!isStaffRoom && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCloseClick(e);
                    }}
                    className="z-20 border-primary border-[1px] absolute -top-1 -left-1 flex items-center justify-center w-[18px] h-[18px] bg-red-600 text-white hover:bg-red-700 transition-colors rounded-full shadow-md"
                    title="Leave room"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <X className="h-3 w-3"/>
                </button>
            )}

            <div className="flex max-w-48 items-center gap-2">
                <span
                    className="truncate text-base font-medium"
                    title={room.chatRoomName}
                >
                    {room.chatRoomName}
                </span>
                {isArchived && (
                    <Badge
                        variant="outline"
                        className="shrink-0 border-amber-300 bg-amber-100/80 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
                    >
                        <Archive className="mr-1 h-3 w-3"/>
                        Archived
                    </Badge>
                )}
            </div>

            <div className="flex items-center mt-0.5 cursor-default">
                <div className="flex items-center gap-2 text-xs">
                    {!isArchived && (
                        <>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400"
                                 title={"Users with this room open and selected"}>
                                <div className="rounded-full bg-green-500 h-1.5 w-1.5"></div>
                                <span className="font-medium">{room.roomPopulation.activeUsersCount}</span>
                            </div>

                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                                 title={"Users with this room open"}>
                                <UserCheck className="h-3 w-3"/>
                                <span className="font-medium">{room.roomPopulation.onlineUsersCount}</span>
                            </div>

                            {room.roomPopulation.totalMessagesCount !== undefined && (
                                <span
                                    className="flex items-center gap-1 text-purple-600 dark:text-purple-400"
                                    title={`Total messages in this room: ${room.roomPopulation.totalMessagesCount.toLocaleString()}`}
                                >
                                    <MessageSquare className="h-3 w-3"/>
                                    <span className="font-medium">
                                        {getMessageCategory(room.roomPopulation.totalMessagesCount)}
                                    </span>
                                </span>
                            )}

                            <span className={`${noise.color} font-bold`} title={noise.title}>
                                {noise.letter}
                            </span>
                        </>
                    )}

                    {(room?.unreadMessagesCount || 0) > 0 && (
                        <span
                            className="flex h-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white min-w-[1.25rem] px-1.5 py-0.5"
                            title={"Unread messages"}
                        >
                            {room.unreadMessagesCount}
                        </span>
                    )}

                    {!isArchived && (
                        <button
                            onClick={onToggleSound}
                            className="rounded-full flex-shrink-0 p-1 transition-colors text-muted-foreground hover:bg-sky-100/35 hover:text-sky-700 dark:hover:bg-white/15 dark:hover:text-white"
                            title={isSoundOn ? "Mute notifications" : "Unmute notifications"}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isSoundOn ? <Volume2 className="h-3.5 w-3.5"/> : <VolumeX className="h-3.5 w-3.5"/>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Wrapper that handles dnd-kit logic
export function RoomTabItem(props: Parameters<typeof RoomTabContent>[0] & { index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: props.room.chatRoomId});

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <RoomTabContent
            {...props}
            innerRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
}
