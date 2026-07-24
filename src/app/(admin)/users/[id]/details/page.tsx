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
import {Button} from "@/components/ui/button";
import {useDialog} from "@/components/providers/DialogProvider";
import {ConfirmModal} from "@/components/ConfirmModal";
import {IdVerificationStatusBadge} from "@/components/IdVerificationStatusBadge";
import {clearIdVerification, requireIdVerification} from "@/api/admin/adminAPI";
import {toast} from "sonner";

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
    const {open, close} = useDialog();

    useEffect(() => {
        if (userId) {
            getUserDetails(userId);
        }
    }, [userId, getUserDetails]);

    const idVerificationStatus = user?.idVerificationStatus ?? 'NONE';
    const requireDisabled = idVerificationStatus === 'REQUIRED'
        || idVerificationStatus === 'PENDING'
        || idVerificationStatus === 'VERIFIED';
    const requireDisabledReason = idVerificationStatus === 'VERIFIED'
        ? "The user has already verified their age"
        : idVerificationStatus === 'PENDING'
            ? "The user's ID verification is already under review"
            : idVerificationStatus === 'REQUIRED'
                ? "ID verification has already been required for this user"
                : undefined;
    const clearDisabled = idVerificationStatus === 'NONE';

    const refetchUserDetails = async () => {
        try {
            await getUserDetails(userId);
        } catch (error) {
            toast.error("Failed to refresh user details");
        }
    };

    const handleRequireIdVerification = () => {
        if (!user) return;

        open(
            <ConfirmModal
                title="Require ID verification?"
                description={`${user.username} will be blocked from using the app until they verify their age with a government ID through Stripe Identity.`}
                onClose={close}
                onConfirm={async () => {
                    try {
                        await requireIdVerification(user.id);
                        close();
                        toast.success("ID verification required");
                    } catch (error) {
                        close();
                        toast.error("Failed to require ID verification");
                    }
                    await refetchUserDetails();
                }}
            />
        );
    };

    const handleClearIdVerification = () => {
        if (!user) return;

        open(
            <ConfirmModal
                title="Clear ID verification requirement?"
                description={`${user.username} will no longer be asked to verify their age and will regain access to the app.`}
                onClose={close}
                onConfirm={async () => {
                    try {
                        await clearIdVerification(user.id);
                        close();
                        toast.success("ID verification requirement cleared");
                    } catch (error) {
                        close();
                        toast.error("Failed to clear ID verification requirement");
                    }
                    await refetchUserDetails();
                }}
            />
        );
    };

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
                        <IdVerificationStatusBadge status={idVerificationStatus}/>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={requireDisabled}
                            title={requireDisabledReason}
                            onClick={handleRequireIdVerification}
                        >
                            Require ID verification
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={clearDisabled}
                            title={clearDisabled ? "No ID verification requirement to clear" : undefined}
                            onClick={handleClearIdVerification}
                        >
                            Clear requirement
                        </Button>
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