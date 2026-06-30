export interface ReactionUpdateResponse {
    reactionId: number;
    chatroomId: number;
    messageId: number;
    responseType: "ADD" | "REMOVE";
    emoji: string;
    emojiId: string;
    reactedBy: {
        id: number;
        username: string;
    };
}