export interface FetchMessagesParams {
    roomId: number;
    afterMessageId?: number;
    beforeMessageId?: number;
    aroundMessageId?: number;
}