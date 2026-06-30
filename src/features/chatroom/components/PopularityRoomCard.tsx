import React from "react";
import {RoomPopulation} from "@/models/roomPopulation";
import {Archive, MessageSquare, UserCheck} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {getMessageCategory} from "@/lib/utils";

interface RoomCardProps {
    room: RoomPopulation;
    onClick?: () => void;
    isJoined?: boolean;
}

const getNoiseIndicator = (level: ChatRoomNoiseLevelEnum) => {
    switch (level) {
        case ChatRoomNoiseLevelEnum.QUIET:
            return {letter: "Q", color: "text-red-500 dark:text-red-400", title: "Quiet (low activity)"};
        case ChatRoomNoiseLevelEnum.CONVERSATIONAL:
            return {
                letter: "C",
                color: "text-green-600 dark:text-green-400",
                title: "Conversational (healthy activity)"
            };
        case ChatRoomNoiseLevelEnum.NOISY:
            return {letter: "N", color: "text-red-600 dark:text-red-400", title: "Noisy (high activity)"};
        default:
            return {letter: "?", color: "text-gray-500 dark:text-gray-400", title: "Unknown activity level"};
    }
};

const formatNumber = (num: number) =>
    num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString();

const PopularityRoomCard: React.FC<RoomCardProps> = ({
                                                         room,
                                                         onClick,
                                                         isJoined,
                                                     }) => {
    const noise = getNoiseIndicator(room.noiseLevel);

    return (
        <div
            onClick={onClick}
            className={`grow flex flex-col min-w-0 cursor-pointer rounded-md px-4 py-2 transition-colors
                ${isJoined
                ? "glass-surface-strong border-green-400/70 text-foreground"
                : room.archived
                    ? "glass-surface border-amber-300/70 dark:border-amber-500/40"
                    : "glass-surface"}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div
                    className="min-w-0 text-lg font-semibold truncate text-foreground"
                    title={room.roomName}
                >
                    {room.roomName}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {room.archived && (
                        <Badge
                            variant="outline"
                            className="border-amber-300 bg-amber-100/80 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                        >
                            <Archive className="mr-1 h-3 w-3"/>
                            Archived
                        </Badge>
                    )}
                </div>
            </div>

            {!room.archived && (
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div
                        className="flex items-center gap-1 text-green-600 dark:text-green-400"
                        title="Users with this room open and selected"
                    >
                        <div className="rounded-full bg-green-500 dark:bg-green-400 h-1.5 w-1.5"/>
                        <span className="font-medium tabular-nums">
                            {formatNumber(room.activeUsersCount)}
                        </span>
                    </div>

                    <div
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                        title="Users with this room open"
                    >
                        <UserCheck className="h-3 w-3"/>
                        <span className="font-medium tabular-nums">
                            {formatNumber(room.onlineUsersCount)}
                        </span>
                    </div>

                    {room.totalMessagesCount !== undefined && (
                        <div
                            className="flex items-center gap-1 text-purple-600 dark:text-purple-400"
                            title={`Total messages in this room: ${room.totalMessagesCount.toLocaleString()}`}
                        >
                            <MessageSquare className="h-3 w-3"/>
                            <span className="font-medium tabular-nums">
                                {getMessageCategory(room.totalMessagesCount)}
                            </span>
                        </div>
                    )}

                    <div
                        title={noise.title}
                        className={`flex items-center gap-1 font-semibold ${noise.color}`}
                    >
                        <span className="px-1 text-sm">{noise.letter}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopularityRoomCard;
