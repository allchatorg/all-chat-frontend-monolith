import {RootState} from "@/redux/store";
import {createSelector} from "@reduxjs/toolkit";
import {UserChatRoom} from "@/models/UserChatRoom";

export const selectJoinedUserChatRoomsState = createSelector(
    [
        (state: RootState) => state.chatRoom.joinedUserChatRooms,
        (state: RootState) => state.chatRoomUi.chatroomOrder
    ],
    (joinedUserChatRooms, chatroomOrder) => {
        if (!chatroomOrder || chatroomOrder.length === 0) return joinedUserChatRooms;

        const roomsMap = new Map(joinedUserChatRooms.map(room => [room.chatRoomId, room]));
        const orderedRooms: UserChatRoom[] = [];
        const unorderedRooms: UserChatRoom[] = [];

        chatroomOrder.forEach(id => {
            const room = roomsMap.get(id);
            if (room) {
                orderedRooms.push(room);
                roomsMap.delete(id);
            }
        });

        roomsMap.forEach(room => {
            unorderedRooms.push(room);
        });

        return [...orderedRooms, ...unorderedRooms];
    }
);

export const selectJoinedUserChatIsLoading = (state: RootState) =>
    state.chatRoom.joinedChatRoomsLoading;

export const selectSelectedChatRoomState = (state: RootState) =>
    state.chatRoom.selectedChatRoom;

export const selectSelectedUserChatRoomState = (state: RootState) =>
    state.chatRoom.selectedUserChatRoom;

export const selectLoadedChatRooms = (state: RootState) =>
    state.chatRoom.loadedChatRooms;

export const selectTopOnlineChatRoomsState = (state: RootState) =>
    state.chatRoom.chatRoomsLeaderBoard.topOnlineChatRooms;

export const selectTopActiveChatRoomsState = (state: RootState) =>
    state.chatRoom.chatRoomsLeaderBoard.topActiveChatRooms;

export const selectSearchedMessagesState = (state: RootState) =>
    state.chatRoom.searchedMessages;

export const selectSearchMessagesParams = (state: RootState) =>
    state.chatRoom.searchMessagesParams;

export const selectTopReactedMessagesState = (state: RootState) =>
    state.chatRoom.topReactedMessages;

export const selectJumpToMessageId = (state: RootState) =>
    state.chatRoomUi.jumpToMessageId;

export const selectChatRoomScrollPosition = (state: RootState) =>
    state.chatRoomUi.chatRoomScrollPositions;

export const selectMessageReactionsState = (state: RootState) =>
    state.chatRoomUi.messageReactionsState;

export const selectEditingMessage = (state: RootState) =>
    state.chatRoomUi.editingMessage;

export const selectReplyingToMessage = (state: RootState) =>
    state.chatRoomUi.replyingToMessage;

export const selectChatRoomsTopMostVisibleMessageId = (state: RootState) =>
    state.chatRoomUi.chatRoomsTopMostVisibleMessageId;

export const selectStompReconnected = (state: RootState) =>
    state.chatRoomUi.stompReconnected;

export const selectStaleChatRoomIds = (state: RootState) =>
    state.chatRoomUi.staleChatRoomIds;

export const selectJoinChatRoomLoading = (state: RootState) =>
    state.chatRoom.joinChatRoomLoading;

export const selectLeaveChatRoomLoading = (state: RootState) =>
    state.chatRoom.leaveChatRoomLoading;

export const selectCreateChatRoomLoading = (state: RootState) =>
    state.chatRoom.createChatRoomLoading;

export const selectChatRoomDetailsLoading = (state: RootState) =>
    state.chatRoom.chatRoomDetailsLoading;