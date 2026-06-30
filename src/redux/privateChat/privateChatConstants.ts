// Sentinel id for a "draft" private conversation that has been opened in the UI
// but not yet persisted on the backend. A draft exists purely client-side until
// the first message is sent; only then is the real ChatRoom created.
export const DRAFT_CHAT_ID = -1;
