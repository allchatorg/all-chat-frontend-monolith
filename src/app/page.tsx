"use client";

import React from "react";
import ChatSection from "../features/chatroom/components/ChatSection";
import RoomTabs from "@/features/chatroom/components/RoomTabs";
import EmptyChatSection from "@/features/chatroom/components/EmptyChatSection";
import RightPanel from "@/features/chatroom/components/RightPanel";
import LeftPanel from "@/features/chatroom/components/LeftPanel";
import {useUser} from "@/lib/hooks/useUser";
import {useChatRooms} from "@/lib/hooks/useChatRooms";
import {useRouter, useSearchParams} from "next/navigation";
import {Spinner} from "@/components/Spinner";
import {useDialog} from "@/components/providers/DialogProvider";
import {CreateChatRoomForm} from "@/features/chatroom/components/CreateChatRoomForm";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {UserChatRoom} from "@/models/UserChatRoom";
import {setChatroomOrder} from "@/redux/chatRoom/chatRoomUiSlice";
import ChatSectionSkeleton from "@/features/chatroom/components/ChatSectionSkeleton";

export default function Home() {
    const {open} = useDialog();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const chatRoomId = searchParams.get("chatRoomId")
        ? parseInt(searchParams.get("chatRoomId") as string, 10)
        : undefined;

    const {user} = useUser();

    const {
        userChatRooms,
        selectedUserChatRoom,
        chatRoom,
        chatRoomLoading,
        handleSelectRoom,
        handleLeaveRoom,
    } = useChatRooms(user, chatRoomId);

    if (!user) {
        router.push("/auth");
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    const handleOpenCreateRoomDialog = () => {
        open(<CreateChatRoomForm/>);
    };

    const handleReorder = (userChatRooms: UserChatRoom[]) => {
        dispatch(setChatroomOrder(userChatRooms.map(room => room.chatRoomId)));
    }

    return (
        <div className="flex h-full w-full gap-x-4 p-2 pb-0 md:p-0 md:px-4">
            <LeftPanel/>
            <div className="flex w-full h-full min-h-0 flex-1 flex-col min-w-0">
                <div className="-mt-4 -ml-1">
                    <RoomTabs
                        rooms={userChatRooms}
                        selectedUserChatRoom={selectedUserChatRoom}
                        onSelectUserChatRoom={handleSelectRoom}
                        onCloseUserChatRoomTab={handleLeaveRoom}
                        onOpenCreateRoom={handleOpenCreateRoomDialog}
                        onReorderRooms={handleReorder}
                    />
                </div>
                <div className="min-h-0 flex-1">
                    {userChatRooms.length === 0 ? (
                        <EmptyChatSection/>
                    ) : chatRoomLoading ? (
                        <ChatSectionSkeleton/>
                    ) : user && chatRoom ? (
                        <ChatSection
                            chatRoom={chatRoom}
                            currentUserId={user.id}
                            selectedUserChatRoom={selectedUserChatRoom}
                            isLoading={chatRoomLoading}
                        />
                    ) : (
                        <ChatSectionSkeleton/>
                    )}
                </div>
            </div>
            <RightPanel/>
        </div>
    );
}
