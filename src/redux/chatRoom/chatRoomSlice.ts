import {ChatRoom} from "@/models/ChatRoom";
import {UserChatRoom} from "@/models/UserChatRoom";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {
    archiveChatRoomThunk,
    createChatRoomThunk,
    fetchChatRoomDetailsThunk,
    fetchChatRoomMessagesThunk,
    fetchJoinedUserChatRoomsThunk,
    fetchTopOnlineRoomsPaginatedThunk,
    fetchTopReactedMessagesThunk,
    joinChatRoomThunk,
    joinRandomChatRoomThunk,
    leaveChatRoomThunk,
    searchChatRoomMessagesThunk,
    setActiveChatRoomThunk,
    unarchiveChatRoomThunk,
    updateLastReadMessageThunk
} from "@/redux/chatRoom/chatRoomThunk";
import {Message} from "@/models/message";
import {RoomPopulation} from "@/models/roomPopulation";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {BanUserNotification} from "@/models/BanUserNotification";
import {revokeBanThunk} from "@/redux/modPanel/modPanelThunk";
import {ReactionUpdateResponse} from "@/models/ReactionUpdateResponse";
import {createEmptyPaginatedResponse} from "@/lib/utils";
import {AdPlacement} from "@/models/AdPlacement";
import {
    addChatRoomReaction,
    getLastNonAdvertMessage,
    patchReplyPreviewsForDeletedMessage,
    patchReplyPreviewsForEditedMessage,
    removeChatRoomReaction,
} from "@/redux/messages/messageReducers";

interface SelectedChatRoomState extends ChatRoom {
}

interface ChatRoomState {
    joinedUserChatRooms: UserChatRoom[];
    joinedChatRoomsLoading: boolean;

    loadedChatRooms: ChatRoom[];
    chatRoomDetailsLoading: boolean;

    selectedChatRoom: SelectedChatRoomState | null;

    searchedMessages: PaginatedResponse<Message> | null;
    searchMessagesParams: SearchMessageRequest | null;
    topReactedMessages: PaginatedResponse<Message> | null;

    selectedUserChatRoom?: UserChatRoom | null;

    joinChatRoomLoading: boolean;
    leaveChatRoomLoading: boolean;
    createChatRoomLoading: boolean;

    chatRoomsLeaderBoard: {
        topOnlineChatRooms: PaginatedResponse<RoomPopulation>,
        topActiveChatRooms: PaginatedResponse<RoomPopulation>,
    }
}

const chatRoomInitialState: ChatRoomState = {
    joinedUserChatRooms: [],
    joinedChatRoomsLoading: false,

    loadedChatRooms: [],
    chatRoomDetailsLoading: false,

    selectedChatRoom: null,
    selectedUserChatRoom: null,

    searchedMessages: null,
    searchMessagesParams: null,
    topReactedMessages: null,

    joinChatRoomLoading: false,
    leaveChatRoomLoading: false,
    createChatRoomLoading: false,

    chatRoomsLeaderBoard: {
        topOnlineChatRooms: createEmptyPaginatedResponse(),
        topActiveChatRooms: createEmptyPaginatedResponse(),
    },
};

function markMessagesAfterBan(messages: Message[], bannedUserId: number, deleteAfter: Date): Message[] {
    return messages.map(message => {
        if (message.senderId === bannedUserId) {
            const markDeleted = new Date(message.createdAt) > deleteAfter;
            return {
                ...message,
                deleted: message.deleted || markDeleted,
                bannedUser: true
            };
        }
        return message;
    });
}

function getDeleteMessagesAfterDate(deleteMessages: boolean, deleteMessagesAfter?: string): Date {
    if (!deleteMessages) {
        return new Date(8640000000000000);
    }

    if (typeof deleteMessagesAfter !== "string" || !deleteMessagesAfter.trim()) {
        return new Date(0);
    }

    const parsedDate = new Date(deleteMessagesAfter);
    if (Number.isNaN(parsedDate.getTime())) {
        return new Date(0);
    }

    return parsedDate;
}

function filterMessagesSentAfterMessage(messages: Message[], targetMessageId: number): Message[] {
    return messages.filter(message => message.id > targetMessageId);
}

function findNonAdvertMessageIndex(messages: Message[], messageId: number): number {
    return messages.findIndex(message => !message.advert && message.id === messageId);
}

function getAdvertInsertIndex(messages: Message[], placement: AdPlacement): number | null {
    const hasNonAdvertMessages = messages.some(message => !message.advert);

    if (placement.afterMessageId === null && placement.beforeMessageId === null) {
        return hasNonAdvertMessages ? null : messages.length;
    }

    if (placement.afterMessageId !== null) {
        const afterIndex = findNonAdvertMessageIndex(messages, placement.afterMessageId);
        return afterIndex === -1 ? null : afterIndex + 1;
    }

    if (placement.beforeMessageId !== null) {
        const beforeIndex = findNonAdvertMessageIndex(messages, placement.beforeMessageId);
        return beforeIndex === -1 ? null : beforeIndex;
    }

    return null;
}

function addAdvertMessageToMessages(messages: Message[], advertMessage: Message, placement: AdPlacement): Message[] {
    if (!advertMessage.advert) {
        return messages;
    }

    if (placement.adId !== advertMessage.id || placement.chatRoomId !== advertMessage.chatRoomId) {
        return messages;
    }

    const advertAlreadyCached = messages.some(message =>
        message.advert && message.id === advertMessage.id
    );

    if (advertAlreadyCached) {
        return messages;
    }

    const insertIndex = getAdvertInsertIndex(messages, placement);

    if (insertIndex === null) {
        return messages;
    }

    return [
        ...messages.slice(0, insertIndex),
        advertMessage,
        ...messages.slice(insertIndex),
    ];
}

function updateChatRoomArchivedStatus(chatRoom: ChatRoom, isArchived: boolean): ChatRoom {
    return {
        ...chatRoom,
        isArchived,
    };
}

function syncChatRoomArchivedStatus(state: ChatRoomState, roomId: number, isArchived: boolean) {
    state.loadedChatRooms = state.loadedChatRooms.map(room =>
        room.id === roomId ? updateChatRoomArchivedStatus(room, isArchived) : room
    );

    if (state.selectedChatRoom?.id === roomId) {
        state.selectedChatRoom = updateChatRoomArchivedStatus(state.selectedChatRoom, isArchived);
    }
}

function removeArchivedRoomFromState(state: ChatRoomState, roomId: number) {
    state.joinedUserChatRooms = state.joinedUserChatRooms.filter(room => room.chatRoomId !== roomId);
    state.loadedChatRooms = state.loadedChatRooms.filter(room => room.id !== roomId);

    if (state.selectedUserChatRoom?.chatRoomId === roomId) {
        state.selectedUserChatRoom = null;
    }

    if (state.selectedChatRoom?.id === roomId) {
        state.selectedChatRoom = null;
        state.searchedMessages = null;
        state.topReactedMessages = null;
    }
}

const chatSlice = createSlice({
    name: 'chat',
    initialState: chatRoomInitialState,
    reducers: {
        setSelectedUserChatRoom(
            state,
            action: PayloadAction<UserChatRoom>
        ) {
            state.selectedUserChatRoom = action.payload;
        },
        setSelectedChatRoom(
            state,
            action: PayloadAction<ChatRoom>
        ) {
            state.selectedChatRoom = action.payload;
        },
        cacheAdvertMessage(
            state,
            action: PayloadAction<{ advertMessage: Message; placement: AdPlacement }>
        ) {
            const {advertMessage, placement} = action.payload;
            if (!advertMessage.advert) return;

            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.id === advertMessage.chatRoomId
                    ? {
                        ...room,
                        messages: addAdvertMessageToMessages(room.messages, advertMessage, placement),
                    }
                    : room
            );

            if (state.selectedChatRoom?.id === advertMessage.chatRoomId) {
                state.selectedChatRoom = {
                    ...state.selectedChatRoom,
                    messages: addAdvertMessageToMessages(state.selectedChatRoom.messages, advertMessage, placement),
                };
            }
        },
        removeLoadedChatRoom(
            state,
            action: PayloadAction<number>
        ) {
            state.loadedChatRooms = state.loadedChatRooms.filter(room => room.id !== action.payload);
            if (state.selectedChatRoom?.id === action.payload) {
                state.selectedChatRoom = null;
            }
        },

        // Websocket handlers
        handleNewMessage(
            state,
            action: PayloadAction<{
                message: Message;
                isByCurrentUser: boolean;
            }>) {

            const {message} = action.payload;

            const userChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === message.chatRoomName
            );

            if (!userChatRoom) {
                return;
            }

            userChatRoom.lastMessage = message;

            if (action.payload.isByCurrentUser) {
                userChatRoom.unreadMessagesCount = 0;
            } else {
                userChatRoom.unreadMessagesCount = (userChatRoom.unreadMessagesCount || 0) + 1;
            }
            userChatRoom.roomPopulation.totalMessagesCount = (userChatRoom.roomPopulation.totalMessagesCount || 0) + 1;

            if (state.selectedUserChatRoom?.chatRoomName === message.chatRoomName) {
                state.selectedUserChatRoom = userChatRoom;
            }

            const chatRoomIndex = state.loadedChatRooms.findIndex(
                room => room.name === message.chatRoomName
            );

            if (chatRoomIndex === -1) {
                return;
            }

            if (state.selectedChatRoom?.id === state.loadedChatRooms[chatRoomIndex].id) {
                if (state.selectedChatRoom.hasNext) {
                    return;
                }

                state.selectedChatRoom = {
                    ...state.selectedChatRoom,
                    messages: [...state.selectedChatRoom.messages, message],
                    totalMessages: state.selectedChatRoom.totalMessages + 1,
                };
            }
            state.loadedChatRooms[chatRoomIndex].messages.push(message);
            state.loadedChatRooms[chatRoomIndex].totalMessages += 1;
        },

        handlePopularityUpdate(
            state,
            action: PayloadAction<RoomPopulation>) {

            const populationUpdate = action.payload;
            const userChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === populationUpdate.roomName
            );

            if (userChatRoom) {
                userChatRoom.roomPopulation = populationUpdate;
            }
        },
        setSearchMessagesParams(
            state,
            action: PayloadAction<SearchMessageRequest>
        ) {
            state.searchMessagesParams = action.payload;
        },
        updateLastReadMessage(
            state,
            action: PayloadAction<{ updatedMessage: Message; isByCurrentUser: boolean }>
        ) {
            const updatedMessage = action.payload.updatedMessage;

            const roomToUpdate = state.joinedUserChatRooms.find(
                (room) => room.chatRoomName === updatedMessage.chatRoomName
            );

            if (!(state.selectedUserChatRoom && state.selectedUserChatRoom.chatRoomName === updatedMessage.chatRoomName)) {
                return;
            }

            if (!roomToUpdate) {
                return;
            }

            state.selectedUserChatRoom.lastReadMessage = updatedMessage;
            state.selectedUserChatRoom.unreadMessagesCount = 0;

            roomToUpdate.lastReadMessage = updatedMessage;
            roomToUpdate.unreadMessagesCount = 0;
        },
        handleChatRoomBanUserNotificationRegularUser(
            state,
            action: PayloadAction<BanUserNotification>
        ) {
            const banNotification = action.payload;
            const {
                roomName: chatRoomName,
                userId: bannedUserId,
                deleteMessagesAfter,
                deleteMessages,
            } = banNotification;

            const targetUserChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === chatRoomName
            );

            const targetLoadedChatRoom = state.loadedChatRooms.find(
                room => room.name === chatRoomName
            );

            const targetSelectedChatRoom = state.selectedChatRoom;

            if (!targetUserChatRoom || !targetLoadedChatRoom) {
                return;
            }

            const deleteMessagesAfterDate = getDeleteMessagesAfterDate(deleteMessages, deleteMessagesAfter);

            const markedMessages = markMessagesAfterBan(
                targetLoadedChatRoom.messages,
                bannedUserId,
                deleteMessagesAfterDate
            )

            const messagesForDeletion = markedMessages.filter(
                message => message.deleted
            )

            const unreadMessagesForDeletion = targetUserChatRoom.lastReadMessage ?
                filterMessagesSentAfterMessage(
                    messagesForDeletion,
                    targetUserChatRoom.lastReadMessage.id
                ) : [];

            const filteredOutDeletedMessages = markedMessages.filter(
                message => !message.deleted
            );

            const updatedTotalMessages = Math.max(0, targetLoadedChatRoom.totalMessages - messagesForDeletion.length);

            const updatedUnreadMessagesCount = targetUserChatRoom.unreadMessagesCount ?
                Math.max(0, targetUserChatRoom.unreadMessagesCount - unreadMessagesForDeletion.length) : 0;

            let lastReadMessage = targetUserChatRoom.lastReadMessage;
            if (messagesForDeletion.some(message => message.id === lastReadMessage?.id)) {
                lastReadMessage = null;
            }

            const lastMessage = getLastNonAdvertMessage(filteredOutDeletedMessages);

            const updatedUserChatRoom: UserChatRoom = {
                ...targetUserChatRoom,
                lastReadMessage: lastReadMessage,
                lastMessage: lastMessage,
                unreadMessagesCount: updatedUnreadMessagesCount,
                roomPopulation: {
                    ...targetUserChatRoom.roomPopulation,
                    totalMessagesCount: updatedTotalMessages
                }
            }

            state.joinedUserChatRooms = state.joinedUserChatRooms.map(room =>
                room.chatRoomName === chatRoomName ? updatedUserChatRoom : room
            );

            state.selectedUserChatRoom = state.selectedUserChatRoom && state.selectedUserChatRoom.chatRoomName === chatRoomName
                ? updatedUserChatRoom : state.selectedUserChatRoom;

            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.name === chatRoomName ? {
                    ...room,
                    messages: filteredOutDeletedMessages,
                    totalMessages: updatedTotalMessages
                } : room
            );

            state.selectedChatRoom = targetSelectedChatRoom && targetSelectedChatRoom.name === chatRoomName
                ? {
                    ...targetSelectedChatRoom,
                    messages: filteredOutDeletedMessages,
                    totalMessages: updatedTotalMessages
                } : targetSelectedChatRoom;
        },
        handleChatRoomBanUserNotificationStaffUser(
            state,
            action: PayloadAction<BanUserNotification>
        ) {
            const banNotification = action.payload;
            const {
                roomName: chatRoomName,
                userId: bannedUserId,
                deleteMessagesAfter,
                deleteMessages,
            } = banNotification;

            const targetUserChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === chatRoomName
            );

            const targetLoadedChatRoom = state.loadedChatRooms.find(
                room => room.name === chatRoomName
            );

            const targetSelectedChatRoom = state.selectedChatRoom;

            if (!targetUserChatRoom || !targetLoadedChatRoom) {
                return;
            }

            const deleteMessagesAfterDate = getDeleteMessagesAfterDate(deleteMessages, deleteMessagesAfter);

            const markedMessages = markMessagesAfterBan(
                targetLoadedChatRoom.messages,
                bannedUserId,
                deleteMessagesAfterDate
            )

            state.selectedChatRoom = targetSelectedChatRoom && targetSelectedChatRoom.name === chatRoomName
                ? {
                    ...targetSelectedChatRoom,
                    messages: markedMessages,
                }
                : targetSelectedChatRoom;

            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.name === chatRoomName
                    ? {
                        ...room,
                        messages: markedMessages,
                    }
                    : room
            );
        },
        handleDeletedMessageStaffUser(
            state,
            action: PayloadAction<Message>
        ) {
            const deletedMessage = action.payload;
            const chatRoomName = deletedMessage.chatRoomName;

            const markDeleted = (messages: Message[]) =>
                patchReplyPreviewsForDeletedMessage(
                    messages.map(message =>
                        message.id === deletedMessage.id
                            ? {...message, deleted: true}
                            : message
                    ),
                    deletedMessage.id,
                    true
                );

            if (state.selectedChatRoom?.name === chatRoomName) {
                state.selectedChatRoom = {
                    ...state.selectedChatRoom,
                    messages: markDeleted(state.selectedChatRoom.messages),
                    totalMessages: Math.max(0, state.selectedChatRoom.totalMessages - 1),
                };
            }

            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.name === chatRoomName
                    ? {
                        ...room,
                        messages: markDeleted(room.messages),
                        totalMessages: Math.max(0, room.totalMessages - 1),
                    }
                    : room
            );

            const targetUserChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === chatRoomName
            );

            if (targetUserChatRoom) {
                targetUserChatRoom.roomPopulation = {
                    ...targetUserChatRoom.roomPopulation,
                    totalMessagesCount: Math.max(
                        0,
                        (targetUserChatRoom.roomPopulation.totalMessagesCount || 0) - 1
                    ),
                };
            }
        }
        ,
        handleDeletedMessageRegularUser(
            state,
            action: PayloadAction<Message>
        ) {
            const deletedMessage = action.payload;
            const chatRoomName = deletedMessage.chatRoomName;

            // Find the target user chat room
            const targetUserChatRoom = state.joinedUserChatRooms.find(
                room => room.chatRoomName === chatRoomName
            );

            // Find the target loaded chat room
            const targetLoadedChatRoom = state.loadedChatRooms.find(
                room => room.name === chatRoomName
            );

            if (!targetUserChatRoom || !targetLoadedChatRoom) {
                return;
            }

            // Filter out the deleted message from loaded chat room messages; replies to it
            // stay visible but their previews switch to the "Message removed" placeholder.
            const filteredMessages = patchReplyPreviewsForDeletedMessage(
                targetLoadedChatRoom.messages.filter(
                    message => message.id !== deletedMessage.id
                ),
                deletedMessage.id,
                false
            );

            // Check if deleted message was unread (sent after lastReadMessage)
            const wasUnread = targetUserChatRoom.lastReadMessage
                ? deletedMessage.id > targetUserChatRoom.lastReadMessage.id
                : true; // If no lastReadMessage, all messages are considered unread

            // Calculate new unread count
            const newUnreadCount = wasUnread
                ? Math.max(0, (targetUserChatRoom.unreadMessagesCount || 0) - 1)
                : targetUserChatRoom.unreadMessagesCount || 0;

            // Determine new last message
            let newLastMessage: Message | null = null;
            if (targetUserChatRoom.lastMessage?.id === deletedMessage.id) {
                // If deleted message was the last message, find the previous one
                newLastMessage = getLastNonAdvertMessage(filteredMessages);
            } else {
                // Keep existing last message if it's not the deleted one
                newLastMessage = targetUserChatRoom.lastMessage || null;
            }

            // Determine new last read message
            let newLastReadMessage: Message | null = targetUserChatRoom.lastReadMessage || null;
            if (targetUserChatRoom.lastReadMessage?.id === deletedMessage.id) {
                // If deleted message was the last read message, find the previous readable message
                const readableMessages = filteredMessages.filter(
                    message => !message.advert && message.id < deletedMessage.id
                );
                newLastReadMessage = readableMessages.length > 0
                    ? readableMessages[readableMessages.length - 1]
                    : null;
            }

            const updatedTotalMessages = targetLoadedChatRoom.totalMessages - 1;

            // Create updated user chat room
            const updatedUserChatRoom: UserChatRoom = {
                ...targetUserChatRoom,
                lastMessage: newLastMessage,
                lastReadMessage: newLastReadMessage,
                unreadMessagesCount: newUnreadCount,
                roomPopulation: {
                    ...targetUserChatRoom.roomPopulation,
                    totalMessagesCount: updatedTotalMessages
                }
            };

            // Update joinedUserChatRooms
            state.joinedUserChatRooms = state.joinedUserChatRooms.map(room =>
                room.chatRoomName === chatRoomName ? updatedUserChatRoom : room
            );


            // Update selectedUserChatRoom if it matches
            if (state.selectedUserChatRoom?.chatRoomName === chatRoomName) {
                state.selectedUserChatRoom = updatedUserChatRoom;
                state.selectedUserChatRoom.roomPopulation.totalMessagesCount = updatedTotalMessages;
            }
            // Update loadedChatRooms
            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.name === chatRoomName ? {
                    ...room,
                    messages: filteredMessages,
                    totalMessages: updatedTotalMessages
                } : room
            );

            // Update selectedChatRoom if it matches
            if (state.selectedChatRoom?.name === chatRoomName) {
                state.selectedChatRoom = {
                    ...state.selectedChatRoom,
                    messages: filteredMessages,
                    totalMessages: updatedTotalMessages
                };
            }
        }, updateUserMessageColor(
            state,
            action: PayloadAction<{ userId: number; hexColor: string }>
        ) {
            const {userId, hexColor} = action.payload;

            const updateColor = (message: Message): Message => {
                if (message.senderId === userId) {
                    return {...message, color: hexColor};
                }
                return message;
            };

            if (state.selectedChatRoom) {
                state.selectedChatRoom.messages = state.selectedChatRoom.messages.map(updateColor);
            }

            state.loadedChatRooms = state.loadedChatRooms.map(room => ({
                ...room,
                messages: room.messages.map(updateColor)
            }));
        }, handleEditMessage(state, action: PayloadAction<Message>) {
            const message = action.payload;
            const chatRoomName = message.chatRoomName;

            const applyEdit = (messages: Message[]) =>
                patchReplyPreviewsForEditedMessage(
                    messages.map(msg => msg.id === message.id ? message : msg),
                    message
                );

            if (state.selectedChatRoom?.name === chatRoomName) {
                state.selectedChatRoom = {
                    ...state.selectedChatRoom,
                    messages: applyEdit(state.selectedChatRoom.messages),
                };
            }

            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                room.name === chatRoomName ? {
                    ...room,
                    messages: applyEdit(room.messages)
                } : room
            );
        },
        addMessageReaction(
            state, action: PayloadAction<{ reactionRequest: ReactionUpdateResponse; reactedByCurrentUser: boolean }>
        ) {
            if (state.selectedChatRoom) {
                state.selectedChatRoom = addChatRoomReaction(state.selectedChatRoom, action.payload.reactionRequest, action.payload.reactedByCurrentUser);
            }
            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                addChatRoomReaction(room, action.payload.reactionRequest, action.payload.reactedByCurrentUser)
            );
        },
        removeMessageReaction(
            state, action: PayloadAction<ReactionUpdateResponse>
        ) {
            if (state.selectedChatRoom) {
                state.selectedChatRoom = removeChatRoomReaction(state.selectedChatRoom, action.payload);
            }
            state.loadedChatRooms = state.loadedChatRooms.map(room =>
                removeChatRoomReaction(room, action.payload)
            );
        },
        handleChatRoomArchivedRegularUser(
            state,
            action: PayloadAction<ChatRoom>
        ) {
            removeArchivedRoomFromState(state, action.payload.id);
        },
        handleChatRoomArchivedStaffUser(
            state,
            action: PayloadAction<ChatRoom>
        ) {
            syncChatRoomArchivedStatus(state, action.payload.id, true);
        },
        handleChatRoomUnarchivedStaffUser(
            state,
            action: PayloadAction<ChatRoom>
        ) {
            syncChatRoomArchivedStatus(state, action.payload.id, false);
        },
    },
    extraReducers:
        (builder) => {
            builder.addCase(fetchJoinedUserChatRoomsThunk.pending, (state, action) => {
                state.joinedChatRoomsLoading = true;
            });
            builder.addCase(fetchJoinedUserChatRoomsThunk.fulfilled, (state, action) => {
                state.joinedUserChatRooms = action.payload;
                state.joinedChatRoomsLoading = false;
            });
            builder.addCase(fetchJoinedUserChatRoomsThunk.rejected, (state, action) => {
                state.joinedChatRoomsLoading = false;
            })
            builder.addCase(createChatRoomThunk.pending, (state) => {
                state.createChatRoomLoading = true;
            });
            builder.addCase(createChatRoomThunk.fulfilled, (state, action) => {
                state.createChatRoomLoading = false;
                state.joinedUserChatRooms.push(action.payload);
                state.selectedUserChatRoom = action.payload;
            });
            builder.addCase(createChatRoomThunk.rejected, (state) => {
                state.createChatRoomLoading = false;
            });
            builder.addCase(fetchChatRoomDetailsThunk.pending, (state) => {
                state.chatRoomDetailsLoading = true;
            });
            builder.addCase(fetchChatRoomDetailsThunk.fulfilled, (state, action) => {
                state.chatRoomDetailsLoading = false;
                const newChatRoom = action.payload;

                state.selectedChatRoom = newChatRoom;

                state.loadedChatRooms = [
                    ...state.loadedChatRooms.filter(room => room.id !== newChatRoom.id),
                    newChatRoom
                ];
            });
            builder.addCase(fetchChatRoomDetailsThunk.rejected, (state) => {
                state.chatRoomDetailsLoading = false;
            });
            builder.addCase(joinChatRoomThunk.pending, (state) => {
                state.joinChatRoomLoading = true;
            });
            builder.addCase(joinChatRoomThunk.fulfilled, (state, action) => {
                state.joinChatRoomLoading = false;
                const joinedRoom = action.payload;

                const index = state.joinedUserChatRooms.findIndex(r => r.id === joinedRoom.id);

                if (index === -1) {
                    state.joinedUserChatRooms.push(joinedRoom);
                } else {
                    state.joinedUserChatRooms[index] = joinedRoom;
                }

                state.selectedUserChatRoom = joinedRoom;
            });
            builder.addCase(joinChatRoomThunk.rejected, (state) => {
                state.joinChatRoomLoading = false;
            });
            builder.addCase(joinRandomChatRoomThunk.pending, (state) => {
                state.joinChatRoomLoading = true;
            });
            builder.addCase(joinRandomChatRoomThunk.fulfilled, (state, action) => {
                state.joinChatRoomLoading = false;
                const joinedRoom = action.payload;

                const index = state.joinedUserChatRooms.findIndex(r => r.id === joinedRoom.id);

                if (index === -1) {
                    state.joinedUserChatRooms.push(joinedRoom);
                } else {
                    state.joinedUserChatRooms[index] = joinedRoom;
                }

                state.selectedUserChatRoom = joinedRoom;
            });
            builder.addCase(joinRandomChatRoomThunk.rejected, (state) => {
                state.joinChatRoomLoading = false;
            });
            builder.addCase(leaveChatRoomThunk.pending, (state) => {
                state.leaveChatRoomLoading = true;
            });
            builder.addCase(leaveChatRoomThunk.fulfilled, (state, action) => {
                state.leaveChatRoomLoading = false;
                const leftRoomId = action.payload;

                state.joinedUserChatRooms = state.joinedUserChatRooms.filter(
                    (room) => room.chatRoomId !== leftRoomId
                );

                state.loadedChatRooms = state.loadedChatRooms.filter(
                    (room) => room.id !== leftRoomId
                );

                if (state.selectedUserChatRoom?.chatRoomId === leftRoomId) {
                    state.selectedUserChatRoom = null
                    state.selectedChatRoom = null;
                }
            });
            builder.addCase(leaveChatRoomThunk.rejected, (state) => {
                state.leaveChatRoomLoading = false;
            });
            builder.addCase(fetchChatRoomMessagesThunk.fulfilled, (state, action) => {
                const {afterMessageId, beforeMessageId} = action.meta.arg;
                const {
                    messages: fetchedMessages,
                    hasNext,
                    hasPrevious,
                    firstMessageId,
                    lastMessageId
                } = action.payload;

                const chatRoom = state.selectedChatRoom;
                if (!chatRoom) return;

                const existingIds = new Set(chatRoom.messages.filter(msg => !msg.advert).map(msg => msg.id));

                const uniqueFetchedMessages = fetchedMessages.filter(msg => !existingIds.has(msg.id));

                let updatedMessages: Message[];
                let updatedChatRoom: ChatRoom;

                if (beforeMessageId !== undefined) {
                    updatedMessages = [...uniqueFetchedMessages, ...chatRoom.messages];
                    updatedChatRoom = {
                        ...chatRoom,
                        messages: updatedMessages,
                        hasPrevious,
                        firstMessageId: firstMessageId ?? chatRoom.firstMessageId,
                    };
                } else if (afterMessageId !== undefined) {
                    updatedMessages = [...chatRoom.messages, ...uniqueFetchedMessages];
                    updatedChatRoom = {
                        ...chatRoom,
                        messages: updatedMessages,
                        hasNext,
                        lastMessageId: lastMessageId ?? chatRoom.lastMessageId,
                    };
                } else {
                    updatedMessages = fetchedMessages;
                    updatedChatRoom = {
                        ...chatRoom,
                        messages: updatedMessages,
                        hasPrevious,
                        hasNext,
                        firstMessageId,
                        lastMessageId,
                    };
                }

                state.selectedChatRoom = updatedChatRoom;
                state.loadedChatRooms = [
                    ...state.loadedChatRooms.filter(room => room.id !== updatedChatRoom.id),
                    updatedChatRoom
                ];
            });
            builder.addCase(revokeBanThunk.fulfilled, (state, action) => {
                const userId = action.meta.arg;

                if (state.selectedChatRoom) {
                    state.selectedChatRoom.messages = state.selectedChatRoom.messages.map(message =>
                        message.senderId === userId && message.bannedUser
                            ? {...message, bannedUser: false}
                            : message
                    );
                }

                state.loadedChatRooms = state.loadedChatRooms.map(room => ({
                    ...room,
                    messages: room.messages.map(message =>
                        message.senderId === userId && message.bannedUser
                            ? {...message, bannedUser: false}
                            : message
                    )
                }));
            });
            builder.addCase(searchChatRoomMessagesThunk.fulfilled, (state, action) => {
                const {roomId} = action.meta.arg;
                const searchedMessages = action.payload;

                if (state.selectedChatRoom?.id === roomId) {
                    state.searchedMessages = searchedMessages;
                } else {
                    state.searchedMessages = null;
                }
            });
            builder.addCase(fetchTopReactedMessagesThunk.fulfilled, (state, action) => {
                const {roomId} = action.meta.arg;
                const topReactedMessages = action.payload;

                if (state.selectedChatRoom?.id === roomId) {
                    state.topReactedMessages = topReactedMessages;
                } else {
                    state.topReactedMessages = null;
                }
            });
            builder.addCase(updateLastReadMessageThunk.fulfilled, (state, action) => {
                const updatedMessage = action.payload;

                if (state.selectedUserChatRoom && state.selectedUserChatRoom.chatRoomName === updatedMessage.chatRoomName) {
                    state.selectedUserChatRoom = {
                        ...state.selectedUserChatRoom,
                        lastReadMessage: updatedMessage,
                        unreadMessagesCount: 0
                    }
                }

                const index = state.joinedUserChatRooms.findIndex(
                    room => room.chatRoomName === updatedMessage.chatRoomName
                );

                if (index === -1) {
                    return;
                }

                state.joinedUserChatRooms[index] = {
                    ...state.joinedUserChatRooms[index],
                    lastReadMessage: updatedMessage,
                    unreadMessagesCount: 0
                };
            });

            builder.addCase(setActiveChatRoomThunk.fulfilled, (state, action) => {
                const updatedRoomPopulation = action.payload;

                if (state.selectedUserChatRoom && state.selectedUserChatRoom.chatRoomId === updatedRoomPopulation.roomId) {
                    state.selectedUserChatRoom.roomPopulation = updatedRoomPopulation;
                }

                const index = state.joinedUserChatRooms.findIndex(
                    room => room.chatRoomId === updatedRoomPopulation.roomId
                );

                if (index !== -1) {
                    state.joinedUserChatRooms[index].roomPopulation = updatedRoomPopulation;
                }
            });
            builder.addCase(archiveChatRoomThunk.fulfilled, (state, action) => {
                syncChatRoomArchivedStatus(state, action.payload, true);
            });
            builder.addCase(unarchiveChatRoomThunk.fulfilled, (state, action) => {
                syncChatRoomArchivedStatus(state, action.payload, false);
            });

            builder.addCase(fetchTopOnlineRoomsPaginatedThunk.fulfilled, (state, action) => {
                state.chatRoomsLeaderBoard.topOnlineChatRooms = action.payload;
            });
        }
})


export const {
    setSelectedUserChatRoom,
    handleNewMessage,
    handlePopularityUpdate,
    setSelectedChatRoom,
    cacheAdvertMessage,
    setSearchMessagesParams,
    updateLastReadMessage,
    handleChatRoomBanUserNotificationRegularUser,
    handleChatRoomBanUserNotificationStaffUser,
    handleDeletedMessageRegularUser,
    handleDeletedMessageStaffUser,
    updateUserMessageColor,
    addMessageReaction,
    removeMessageReaction,
    handleEditMessage,
    handleChatRoomArchivedRegularUser,
    handleChatRoomArchivedStaffUser,
    handleChatRoomUnarchivedStaffUser,
    removeLoadedChatRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
