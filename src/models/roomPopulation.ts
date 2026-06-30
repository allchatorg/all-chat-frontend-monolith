import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";

export interface RoomPopulation {
    roomId: number;
    roomName: string;
    onlineUsersCount: number;
    activeUsersCount: number;
    totalMessagesCount: number;
    noiseLevel: ChatRoomNoiseLevelEnum;
    archived: boolean;
}
