import {RoomPopulation} from "@/models/roomPopulation";
import {Message} from "@/models/message";
import {WebSocketMessageType} from "@/models/WebSocketMessageType";
import {BanUserNotification} from "@/models/BanUserNotification";
import {RoleUpdateNotification} from "@/models/RoleUpdate";
import {ReactionUpdateResponse} from "@/models/ReactionUpdateResponse";
import {ReportNotification} from "@/models/ReportNotification";
import {ChatRoom} from "@/models/ChatRoom";
import {MessagingAvailability} from "@/models/MessagingAvailability";

type WarnUserResponse = {
    description: string;
};

export type WebSocketMessage =
    | {
    type: WebSocketMessageType.NEW_MESSAGE;
    chatRoomName: string;
    data: Message;
}
    | {
    type: WebSocketMessageType.POPULARITY_UPDATE;
    chatRoomName: string;
    data: RoomPopulation;
} | {
    type: WebSocketMessageType.BAN_USER;
    data: any;
} | {
    type: WebSocketMessageType.BAN_USER_CHAT_NOTIFICATION;
    data: BanUserNotification;
} | {
    type: WebSocketMessageType.WARN_USER
    data: WarnUserResponse;
} | {
    type: WebSocketMessageType.ROLE_UPDATE_NOTIFICATION;
    data: RoleUpdateNotification;
} | {
    type: WebSocketMessageType.DELETE_MESSAGE;
    chatRoomName: string;
    data: Message;
} | {
    type: WebSocketMessageType.MESSAGE_REACTION_UPDATE;
    data: ReactionUpdateResponse;
} | {
    type: WebSocketMessageType.MESSAGE_EDIT;
    data: Message;
} | {
    type: WebSocketMessageType.REPORT_NOTIFICATION;
    data: ReportNotification;
} | {
    type: WebSocketMessageType.CHATROOM_ARCHIVED;
    chatRoomName: string;
    data: ChatRoom;
} | {
    type: WebSocketMessageType.CHATROOM_UNARCHIVED;
    chatRoomName: string;
    data: ChatRoom;
} | {
    type: WebSocketMessageType.MESSAGE_SENDING_AVAILABILITY_UPDATE;
    data: MessagingAvailability;
} | {
    type: WebSocketMessageType.PRIVATE_NEW_MESSAGE;
    chatRoomName: null;
    data: Message;
} | {
    type: WebSocketMessageType.PRIVATE_MESSAGE_EDIT;
    chatRoomName: null;
    data: Message;
} | {
    type: WebSocketMessageType.PRIVATE_MESSAGE_DELETE;
    chatRoomName: null;
    data: Message;
}
