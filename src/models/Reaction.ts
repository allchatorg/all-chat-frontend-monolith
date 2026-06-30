import {UserMinimal} from "@/models/User";

export interface Reaction {
    id?: number;
    tempId?: string;
    messageId: number;
    emoji: string;
    emojiId: string;
    usersCount?: number;
    reactedByCurrentUser: boolean;
    users?: UserMinimal[];
}
