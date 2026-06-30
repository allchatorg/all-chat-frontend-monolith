'use client'

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import React, {useEffect, useState} from 'react';
import {Search, Shield} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchActiveBansThunk} from "@/redux/admin/adminThunk";
import {useSelector} from "react-redux";
import {selectActiveBans} from "@/redux/admin/adminSelector";
import {BanCard} from "@/app/(admin)/bans/components/BanCard";
import {revokeBanThunk} from "@/redux/modPanel/modPanelThunk";
import {AdminPageHeader} from "@/components/AdminPageHeader";

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 500;

export default function Bans() {
    const [fetchActiveBans, isLoading, error] = useThunk(searchActiveBansThunk);
    const [revokeBan, revokeBanIsLoading, revokeBanError] = useThunk(revokeBanThunk);

    const {content = [], totalPages = 0, number: pageIndex = 0, totalElements} = useSelector(selectActiveBans);

    const [searchTerm, setSearchTerm] = useState("");
    const current = pageIndex + 1;

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchActiveBans({
                pageSize: PAGE_SIZE,
                page: 0,
                userNameOrId: searchTerm.trim().length > 0 ? searchTerm : undefined
            });
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [searchTerm, fetchActiveBans]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchActiveBans({
            pageSize: PAGE_SIZE,
            page: page - 1,
            userNameOrId: searchTerm.trim().length > 0 ? searchTerm : undefined
        });
    };

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <AdminPageHeader
                title="Ban List"
                description="Bans are by default account bans and IP bans. Use the search to find specific users or review active restrictions."
                icon={Shield}
            />

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Search Bans</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Search by user ID or username to find specific active ban records
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search
                                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"/>
                            <Input

                                placeholder="Search bans by userId or username"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="min-h-0 flex-1 overflow-y-auto flex flex-col">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Active Bans ({totalElements})
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Currently enforced ban restrictions
                        {searchTerm && ` matching "${searchTerm}"`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="py-8 text-center">
                                    <div
                                        className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground">Loading bans...</p>
                                </div>
                            ) : content.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    {searchTerm
                                        ? `No active bans found matching "${searchTerm}".`
                                        : "No active bans found."
                                    }
                                </div>
                            ) : (
                                content.map((ban) => (
                                    <BanCard key={ban.id} ban={ban} revokeBan={revokeBan}/>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 border-t">
                    <PaginationFooter
                        className="w-full p-0 border-0 mt-0"
                        totalPages={totalPages || 0}
                        currentPage={current}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}