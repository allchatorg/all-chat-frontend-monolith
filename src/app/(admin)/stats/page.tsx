'use client'

import React, {useCallback, useEffect, useState} from 'react';
import {Activity, Ban, BarChart3, Hash, MessageSquare, MessagesSquare, RefreshCw, Upload, UserPlus, Wifi} from "lucide-react";
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {getSiteStatistics} from "@/api/admin/adminAPI";
import {SiteStatistics} from "@/models/SiteStatistics";
import {usePageVisibility} from "@/lib/hooks/usePageVisibility";
import {cn, formatFileSize} from "@/lib/utils";
import {StatCard} from "@/app/(admin)/stats/components/StatCard";
import {TrendsSection} from "@/app/(admin)/stats/components/TrendsSection";

const REFRESH_INTERVAL_MS = 30_000;

const count = (value: number) => value.toLocaleString();

export default function Stats() {
    const [stats, setStats] = useState<SiteStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // Bumping this reloads everything and restarts the polling timer.
    const [refreshToken, setRefreshToken] = useState(0);
    const isVisible = usePageVisibility();

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            setStats(await getSiteStatistics());
            setError(false);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        loadStats();
        const interval = setInterval(loadStats, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isVisible, loadStats, refreshToken]);

    const refresh = () => setRefreshToken(token => token + 1);

    return (
        <div className="flex w-full flex-col px-2 pb-4 sm:px-4 space-y-2 sm:space-y-4">
            <AdminPageHeader
                title="Site Stats"
                description="Live activity and totals across the site. Refreshes every 30 seconds."
                icon={BarChart3}
            >
                {stats && (
                    <span className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
                        {error ? "Couldn't refresh · " : ""}Updated {new Date(stats.generatedAt).toLocaleTimeString()}
                    </span>
                )}
                <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
                    Refresh
                </Button>
            </AdminPageHeader>

            {error && !stats ? (
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6" role="alert">
                        <p className="text-sm text-muted-foreground">Site stats could not be loaded.</p>
                        <Button size="sm" variant="outline" onClick={refresh}>Retry</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                    {!stats ? Array.from({length: 8}, (_, index) => (
                        <Skeleton key={index} className="h-32 rounded-xl"/>
                    )) : (
                        <>
                            <StatCard title="Online now" icon={Wifi} value={count(stats.presence.online)}
                                      description="Users with the site open"/>
                            <StatCard title="Active now" icon={Activity} value={count(stats.presence.active)}
                                      description="Viewing a public room in the last 45 seconds"/>
                            <StatCard title="Messages (24h)" icon={MessageSquare} value={count(stats.messages.last24h)}
                                      description="Sent in the last 24 hours"/>
                            <StatCard title="Total messages" icon={MessagesSquare} value={count(stats.messages.total)}
                                      description="All time, including deleted"/>
                            <StatCard title="Uploaded" icon={Upload} value={formatFileSize(stats.uploads.totalBytes)}
                                      description={`+${formatFileSize(stats.uploads.last24hBytes)} in 24h · ${formatFileSize(stats.uploads.storedBytes)} stored in ${count(stats.uploads.storedFiles)} files`}/>
                            <StatCard title="Rooms" icon={Hash} value={count(stats.rooms.publicRooms)}
                                      description={`+${count(stats.rooms.last24h)} in 24h · ${count(stats.rooms.privateChats)} private chats`}/>
                            <StatCard title="Accounts" icon={UserPlus} value={count(stats.accounts.total)}
                                      description={`+${count(stats.accounts.last24h)} in 24h · ${count(stats.accounts.registered)} registered · ${count(stats.accounts.guests)} guests`}/>
                            <StatCard title="Banned users" icon={Ban} value={count(stats.bans.bannedUsers)}
                                      description={`${count(stats.bans.issuedLast24h)} bans issued in 24h`}/>
                        </>
                    )}
                </div>
            )}

            <TrendsSection refreshToken={refreshToken}/>
        </div>
    );
}
