import {RoomPopulation} from "@/models/roomPopulation";
import {Message} from "@/models/message";
import {Role} from "@/models/Role";

export interface UserChatRoom {
    id: number;
    chatRoomName: string;
    chatRoomRequiredAccessLevel: Role;
    chatRoomId: number;
    roomPopulation: RoomPopulation;
    unreadMessagesCount?: number;
    lastMessage: Message | null;
    lastReadMessage: Message | null;
}