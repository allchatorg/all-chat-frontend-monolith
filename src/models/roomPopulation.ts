import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";

export interface RoomPopulation {
    proOnly?: boolean;
    roomId: number;
    roomName: string;
    onlineUsersCount: number;
    activeUsersCount: number;
    totalMessagesCount: number;
    noiseLevel: ChatRoomNoiseLevelEnum;
    archived: boolean;
}
