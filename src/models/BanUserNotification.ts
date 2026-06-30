import {BanTypeEnum} from "@/models/BanTypeEnum";

export interface BanUserNotification {
    userId: number;
    roomName: string;
    banType: BanTypeEnum;
    deleteMessages: boolean;
    deleteMessagesAfter: string;
}