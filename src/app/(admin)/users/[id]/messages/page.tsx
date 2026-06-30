'use client';

import {useSelector} from "react-redux";
import {selectUserAdminView, selectUserMessages} from "@/redux/admin/adminSelector";
import {useThunk} from "@/lib/hooks/useThunk";
import {getUserMessagesThunk} from "@/redux/admin/adminThunk";
import React, {useEffect, useState} from "react";
import SearchMessagesDisplay from "@/features/chatroom/components/SearchMessagesDisplay";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {Message} from "@/models/message";
import {useRouter} from "next/navigation";

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 500;

export default function Page() {
    const router = useRouter();

    const {content = [], totalPages = 0, number: pageIndex = 0} = useSelector(selectUserMessages);
    const user = useSelector(selectUserAdminView);

    const [searchMessages, searchMessagesIsLoading, searchMessagesError] = useThunk(getUserMessagesThunk);

    const [searchTerm, setSearchTerm] = useState("");
    const currentIndex = pageIndex + 1;


    useEffect(() => {
        if (!user) return;

        const handler = setTimeout(() => {
            searchMessages({
                page: 0,
                size: PAGE_SIZE,
                senderUsername: user.username,
                content: searchTerm.trim().length > 0 ? searchTerm : undefined,
            });
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [searchTerm, user]);

    const handlePageChange = (page: number) => {
        if (!user) return;
        if (page < 1 || page > totalPages) return;

        searchMessages({
            page: page - 1,
            size: PAGE_SIZE,
            senderUsername: user.username,
            content: searchTerm.trim().length > 0 ? searchTerm : undefined,
        });
    };

    const handleMessageClick = (message: Message) => {
        router.push(`/?chatRoomId=${message.chatRoomId}&jumpTo=${message.id}`);
    };

    return (
        <div className="flex h-full min-h-0 flex-col space-y-4">
            <Card className="flex-shrink-0">
                <CardHeader>
                    <CardTitle>Search Messages</CardTitle>
                    <CardDescription>
                        Search through {user?.username}'s messages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search
                                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"/>
                            <Input
                                placeholder="Search messages by content"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <SearchMessagesDisplay
                showTitle={false}
                showMessageChatRoomName={true}
                messages={content}
                isLoading={searchMessagesIsLoading}
                totalPages={totalPages}
                currentPage={currentIndex}
                onPageChange={handlePageChange}
                onMessageClick={handleMessageClick}
            />
        </div>
    );
}