"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Card} from "@/components/ui/card";
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {Badge} from "@/components/ui/badge";
import {ChevronsUpDown, FileText, X} from "lucide-react";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchAuditLogs} from "@/redux/audit-logs/auditLogsThunk";
import {auditlogs} from "@/redux/audit-logs/auditLogsSelector";
import {AuditLogAccordion} from "@/components/AuditLogAccordion";
import UserSearchCommand from "@/components/UserSearchCommand";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import type {User} from "@/models/User";
import {AuditLogActorType, AuditLogType} from "@/models/AuditLog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {ScrollArea} from "@/components/ui/scroll-area";

const PAGE_SIZE = 10;

export default function AuditLogsPage() {
    const logsPage = useSelector(auditlogs);
    const currentPage = logsPage.number + 1;

    const [fetchAuditLogs, loading] = useThunk(searchAuditLogs);

    const [createdBy, setCreatedBy] = useState<{ id: number; username: string } | null>(null);
    const [creatorType, setCreatorType] = useState<AuditLogActorType | null>(null);
    const [targetUser, setTargetUser] = useState<{ id: number; username: string } | null>(null);
    const [selectedType, setSelectedType] = useState<AuditLogType | null>(null);
    const effectiveCreatedByType = createdBy ? AuditLogActorType.USER : creatorType;

    const currentParams = useMemo(() => ({
        page: 0,
        size: PAGE_SIZE,
        ...(effectiveCreatedByType ? {createdByType: effectiveCreatedByType} : {}),
        ...(createdBy ? {createdByUserId: createdBy.id} : {}),
        ...(targetUser ? {targetUserId: targetUser.id} : {}),
        ...(selectedType ? {auditLogType: selectedType} : {}),
    }), [createdBy, effectiveCreatedByType, targetUser, selectedType]);

    useEffect(() => {
        fetchAuditLogs(currentParams);
    }, [currentParams, fetchAuditLogs]);

    const handlePageChange = (page: number) => {
        fetchAuditLogs({
            page: page - 1,
            size: PAGE_SIZE,
            ...(effectiveCreatedByType ? {createdByType: effectiveCreatedByType} : {}),
            ...(createdBy ? {createdByUserId: createdBy.id} : {}),
            ...(targetUser ? {targetUserId: targetUser.id} : {}),
            ...(selectedType ? {auditLogType: selectedType} : {}),
        });
    };

    const onSelectCreatedBy = (user: User) => {
        setCreatorType(AuditLogActorType.USER);
        setCreatedBy({id: user.id, username: user.username});
    };

    const onSelectTargetUser = (user: User) => {
        setTargetUser({id: user.id, username: user.username});
    };

    const handleClearFilters = () => {
        setCreatedBy(null);
        setCreatorType(null);
        setTargetUser(null);
        setSelectedType(null);
    };

    const clearCreatedBy = () => setCreatedBy(null);
    const clearCreatorType = () => setCreatorType(null);
    const clearTargetUser = () => setTargetUser(null);

    const handleCreatorTypeSelect = (type: AuditLogActorType | null) => {
        setCreatorType(type);
        if (type === AuditLogActorType.SYSTEM) {
            setCreatedBy(null);
        }
    };

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <div className="mx-auto w-full space-y-4">
                <AdminPageHeader
                    title="Audit Logs"
                    description="Review system audit logs and moderation actions"
                    icon={FileText}
                />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={creatorType === AuditLogActorType.SYSTEM}
                                    className="w-full sm:w-[260px] justify-between">
                                    {createdBy
                                        ? `Created by: ${createdBy.username}`
                                        : creatorType === AuditLogActorType.SYSTEM
                                            ? "System creator selected"
                                            : "Select creator..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[320px]">
                                <UserSearchCommand onSelectUser={onSelectCreatedBy} placeholder="Search creator..."/>
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" role="combobox"
                                        className="w-full sm:w-[220px] justify-between">
                                    {creatorType ? `Creator type: ${creatorType}` : "All creators"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-[220px]">
                                <DropdownMenuItem onClick={() => handleCreatorTypeSelect(null)}>
                                    All creators
                                </DropdownMenuItem>
                                {Object.values(AuditLogActorType).map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => handleCreatorTypeSelect(type)}
                                    >
                                        {type}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox"
                                        className="w-full sm:w-[260px] justify-between">
                                    {targetUser ? `Target user: ${targetUser.username}` : "Select target user..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[320px]">
                                <UserSearchCommand onSelectUser={onSelectTargetUser}
                                                   placeholder="Search target user..."/>
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" role="combobox"
                                        className="w-full sm:w-[260px] justify-between">
                                    {selectedType ? selectedType : "Select log type..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-[260px]">
                                {Object.values(AuditLogType).map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {type}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {createdBy && (
                            <Badge variant="secondary" className="cursor-pointer" onClick={clearCreatedBy}>
                                Created by: {createdBy.username}
                                <X className="ml-1 h-3 w-3"/>
                            </Badge>
                        )}
                        {creatorType && (
                            <Badge variant="secondary" className="cursor-pointer" onClick={clearCreatorType}>
                                Creator type: {creatorType}
                                <X className="ml-1 h-3 w-3"/>
                            </Badge>
                        )}
                        {targetUser && (
                            <Badge variant="secondary" className="cursor-pointer" onClick={clearTargetUser}>
                                Target: {targetUser.username}
                                <X className="ml-1 h-3 w-3"/>
                            </Badge>
                        )}
                    </div>

                    {(createdBy || creatorType || targetUser || selectedType) && (
                        <Button
                            variant="ghost"
                            className="ml-auto w-full sm:w-auto"
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="flex-1 min-h-0 p-4">
                    {loading ? (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                            Loading audit logs...
                        </div>
                    ) : (
                        <div className="flex h-full flex-col">
                            <ScrollArea className="flex-1">
                                {logsPage.content && logsPage.content.length > 0 ? (
                                    <AuditLogAccordion logs={logsPage.content}/>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center space-y-2">
                                            <FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
                                            <h3 className="text-lg font-medium">No logs found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {(createdBy || creatorType || targetUser || selectedType)
                                                    ? "No audit logs match your current filters. Try adjusting your search criteria."
                                                    : "No audit logs are available at this time."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>

                            {logsPage.content && logsPage.content.length > 0 && (
                                <div className="shrink-0 border-t pt-4 mt-4">
                                    <PaginationFooter
                                        totalPages={logsPage.totalPages}
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
