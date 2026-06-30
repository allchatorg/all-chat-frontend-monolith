import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchBlockedUsersThunk, unblockUserThunk} from "@/redux/user/usersThunk";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Ban} from "lucide-react";

import {UserMinimal} from "@/models/User";

interface BlockedUsersSettingsProps {
    isMobile?: boolean;
}

export const BlockedUsersSettings = ({isMobile = false}: BlockedUsersSettingsProps) => {
    const {user} = useSelector((state: RootState) => state.user);
    const [runFetchBlockedUsers, isLoadingBlockedUsers] = useThunk(fetchBlockedUsersThunk);
    const [runUnblockUser, isUnblocking] = useThunk(unblockUserThunk);

    useEffect(() => {
        runFetchBlockedUsers();
    }, [runFetchBlockedUsers]);

    const handleUnblock = (userId: number) => {
        runUnblockUser(userId);
    };

    return (
        <div className="p-0  md:p-6 space-y-4 md:space-y-6">
            {!isMobile && (
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blocked Users</h1>
                    <p className="text-muted-foreground">
                        Manage your blocked users and control who can interact with you.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Blocked Accounts</CardTitle>
                    <CardDescription>
                        View and manage users you have blocked.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                    <Separator/>
                    <div className="space-y-3">
                        {isLoadingBlockedUsers && (
                            <div className="text-center text-muted-foreground py-8">Loading...</div>
                        )}
                        {!isLoadingBlockedUsers && user?.blockedUsers?.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No blocked users found.
                            </div>
                        )}
                        {user?.blockedUsers?.map((blockedUser: UserMinimal) => (
                            <div
                                key={blockedUser.id}
                                className="flex items-center justify-between py-2 px-3 md:py-3 md:px-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <p className="font-medium">{blockedUser.username}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnblock(blockedUser.id)}
                                    disabled={isUnblocking}
                                >
                                    <Ban className="mr-2 h-4 w-4"/>
                                    Unblock
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
