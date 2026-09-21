import type {UserMinimalDTO} from "@/models/UserMinimalDTO";

export interface ReactionUpdateResponse {
    reactionId: number;
    chatroomId: number;
    messageId: number;
    responseType: "ADD" | "REMOVE";
    emoji: string;
    emojiId: string;
    reactedBy: UserMinimalDTO;
}
