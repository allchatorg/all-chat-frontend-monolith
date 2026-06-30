'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity, Calendar, Clock, Crown, Globe, HardDrive, Hash, HistoryIcon, Mail, Shield, User} from 'lucide-react';
import React, {useEffect} from 'react';
import {Separator} from "@radix-ui/react-menu";
import {Badge} from "@/components/ui/badge";
import {useThunk} from "@/lib/hooks/useThunk";
import {getUserAdminViewDetailsThunk} from "@/redux/admin/adminThunk";
import {useSelector} from "react-redux";
import {selectUserAdminView} from "@/redux/admin/adminSelector";
import {useParams} from "next/navigation";
import {UserAdminView} from "@/models/UserAdminView";
import {getCountryName} from "@/lib/utils/countryUtils";
import {CountryFlag} from "@/features/chatroom/components/CountryFlag";

interface UserAdminViewProps {
    user: UserAdminView;
}

const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(dateObj);
};

const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
};

const StatusBadge = ({condition, trueLabel, falseLabel, trueVariant = "default", falseVariant = "secondary"}: {
    condition: boolean;
    trueLabel: string;
    falseLabel: string;
    trueVariant?: "default" | "secondary" | "destructive" | "outline";
    falseVariant?: "default" | "secondary" | "destructive" | "outline";
}) => (
    <Badge variant={condition ? trueVariant : falseVariant}>
        {condition ? trueLabel : falseLabel}
    </Badge>
);

export default function UserDetailsPage() {
    const params = useParams();
    const userId = Number(params.id) || 0;
    const [getUserDetails, userDetailsIsLoading, userDetailsError] = useThunk(getUserAdminViewDetailsThunk);
    const user = useSelector(selectUserAdminView);

    useEffect(() => {
        if (userId) {
            getUserDetails(userId);
        }
    }, [userId, getUserDetails]);

    if (user === null || userDetailsIsLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading user details...</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5"/>
                        User Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-muted-foreground"/>
                            <div>
                                <p className="text-sm font-medium">User ID</p>
                                <p className="text-sm text-muted-foreground">{user.id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground"/>
                            <div>
                                <p className="text-sm font-medium">Username</p>
                                <p className="text-sm text-muted-foreground">{user.username}</p>
                            </div>
                        </div>

                        {user.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Crown className="h-4 w-4 text-muted-foreground"/>
                            <div>
                                <p className="text-sm font-medium">Role</p>
                                <Badge
                                    className="dark:text-black text-white"
                                    style={{
                                        backgroundColor: user.role.toString(),
                                        borderColor: user.role.toString()
                                    }}
                                >
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        {user.countryCode && (
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="flex gap-1 justify-center text-sm text-muted-foreground">
                                        {user.countryCode && <CountryFlag countryCode={user.countryCode}/>}
                                        {getCountryName(user.countryCode)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5"/>
                        Account Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge
                            condition={user.verified}
                            trueLabel="Verified"
                            falseLabel="Not Verified"
                            trueVariant="default"
                            falseVariant="outline"
                        />
                        <StatusBadge
                            condition={user.claimed}
                            trueLabel="Claimed"
                            falseLabel="Unclaimed"
                            trueVariant="default"
                            falseVariant="secondary"
                        />
                        <StatusBadge
                            condition={user.isOver18}
                            trueLabel="18+"
                            falseLabel="Under 18"
                            trueVariant="default"
                            falseVariant="secondary"
                        />
                        <StatusBadge
                            condition={user.banned}
                            trueLabel="Banned"
                            falseLabel="Active"
                            trueVariant="destructive"
                            falseVariant="default"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5"/>
                        Activity Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                            <div>
                                <p className="text-sm font-medium">Created At</p>
                                <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground"/>
                            <div>
                                <p className="text-sm font-medium">Last Login</p>
                                <p className="text-sm text-muted-foreground">{formatDate(user.lastLoginAt)}</p>
                            </div>
                        </div>
                    </div>

                    <Separator/>

                    <div className="flex items-center gap-3">
                        <HardDrive className="h-4 w-4 text-muted-foreground"/>
                        <div>
                            <p className="text-sm font-medium">Total Upload Usage</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(user.totalUploadUsage)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {user.previousUsernames.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5"/>
                            Username History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {user.previousUsernames.map((username, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground"/>
                                    <span className="text-sm text-muted-foreground">{username}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}