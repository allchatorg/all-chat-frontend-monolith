export interface AdPlacement {
    adId: number;
    chatRoomId: number;
    afterMessageId: number | null;
    beforeMessageId: number | null;
    placedAt: string;
}
