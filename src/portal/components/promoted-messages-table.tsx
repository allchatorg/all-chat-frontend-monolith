"use client"

import * as React from "react"
import {Badge} from "@ads/components/ui/badge"
import {Tabs, TabsList, TabsTrigger} from "@ads/components/ui/tabs"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ads/components/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ads/components/ui/select"
import {Button} from "@ads/components/ui/button"
import {Input} from "@ads/components/ui/input"
import {ArrowUpDown, Eye, Megaphone, Search} from "lucide-react"
import {useRouter} from "next/navigation"
import {PromotedMessage, PromotedMessageStatus} from "@ads/models/promoted-message"

export type PromotedMessageStatusFilter = PromotedMessageStatus | "ALL"

const STATUS_TABS: { value: PromotedMessageStatusFilter; label: string }[] = [
    {value: "ALL", label: "All"},
    {value: PromotedMessageStatus.PENDING, label: "Pending"},
    {value: PromotedMessageStatus.APPROVED, label: "Approved"},
    {value: PromotedMessageStatus.DENIED, label: "Denied"},
    {value: PromotedMessageStatus.CANCELED, label: "Canceled"},
]

// Shared status badge coloring: PENDING amber / APPROVED green / DENIED red / CANCELED gray.
export function getPromotionStatusBadgeClass(status: PromotedMessageStatus): string {
    switch (status) {
        case PromotedMessageStatus.PENDING:
            return "bg-amber-500 hover:bg-amber-600 text-white"
        case PromotedMessageStatus.APPROVED:
            return "bg-green-500 hover:bg-green-600 text-white"
        case PromotedMessageStatus.DENIED:
            return "bg-red-500 hover:bg-red-600 text-white"
        case PromotedMessageStatus.CANCELED:
            return "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700"
        default:
            return "bg-secondary"
    }
}

interface PromotedMessagesTableProps {
    promotions: PromotedMessage[]
    status: PromotedMessageStatusFilter
    onStatusChange: (status: PromotedMessageStatusFilter) => void
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    isAdmin?: boolean
    // Admin-only: debounced email/userId search + submittedAt sort toggle
    searchQuery?: string
    onSearchQueryChange?: (value: string) => void
    sort?: string
    onSortChange?: (value: string) => void
}

export function PromotedMessagesTable({
                                          promotions,
                                          status,
                                          onStatusChange,
                                          page,
                                          totalPages,
                                          onPageChange,
                                          isAdmin = false,
                                          searchQuery,
                                          onSearchQueryChange,
                                          sort,
                                          onSortChange,
                                      }: PromotedMessagesTableProps) {
    const router = useRouter()

    const toggleSort = () => {
        if (!onSortChange || !sort) return
        const [, order] = sort.split(",")
        onSortChange(`submittedAt,${order === "asc" ? "desc" : "asc"}`)
    }

    const handleViewDetailsClick = (id: number) => {
        router.push(isAdmin ? `/portal/admin/promoted-messages/${id}` : `/portal/promoted-messages/${id}`)
    }

    return (
        <div className="space-y-4">
            <Tabs
                value={status}
                onValueChange={(val) => onStatusChange(val as PromotedMessageStatusFilter)}
                className="w-full"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Select
                        value={status}
                        onValueChange={(val) => onStatusChange(val as PromotedMessageStatusFilter)}
                    >
                        <SelectTrigger className="w-[170px] lg:hidden">
                            <SelectValue placeholder="Filter by Status"/>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_TABS.map((tab) => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    {tab.value === "ALL" ? "All Statuses" : tab.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <TabsList className="hidden lg:flex h-9">
                        {STATUS_TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </Tabs>

            {isAdmin && (
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 pb-2">
                    <div className="relative flex-1 w-full lg:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            type="text"
                            placeholder="Search by email or user ID..."
                            value={searchQuery || ""}
                            onChange={(e) => onSearchQueryChange?.(e.target.value)}
                            className="h-9 pl-9 w-full"
                        />
                    </div>
                </div>
            )}

            <div className="rounded-md border bg-card text-card-foreground overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Message</TableHead>
                                <TableHead>Chat Room</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>
                                    {onSortChange && sort ? (
                                        <Button
                                            variant="ghost"
                                            onClick={toggleSort}
                                            className="-ml-4 h-8 data-[state=open]:bg-accent"
                                        >
                                            Submitted
                                            <ArrowUpDown className="ml-2 h-4 w-4"/>
                                        </Button>
                                    ) : (
                                        "Submitted"
                                    )}
                                </TableHead>
                                {isAdmin && <TableHead>Email</TableHead>}
                                {isAdmin && <TableHead>User ID</TableHead>}
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 8 : 6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 py-8">
                                            <Megaphone className="w-12 h-12 text-muted-foreground/50"/>
                                            <p className="font-medium text-muted-foreground">No promoted messages
                                                found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promotion) => (
                                    <TableRow key={promotion.id}>
                                        <TableCell className="max-w-[280px]">
                                            <span className="line-clamp-2 whitespace-pre-wrap break-words text-sm">
                                                {promotion.messageContent}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{promotion.chatRoomName}</TableCell>
                                        <TableCell className="text-right">${promotion.amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(promotion.submittedAt)}
                                        </TableCell>
                                        {isAdmin && <TableCell>{promotion.email}</TableCell>}
                                        {isAdmin &&
                                            <TableCell className="text-muted-foreground">{promotion.userId}</TableCell>}
                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1">
                                                <Badge
                                                    className={`px-2.5 py-0.5 capitalize font-medium ${getPromotionStatusBadgeClass(promotion.status)}`}>
                                                    {promotion.status}
                                                </Badge>
                                                {isAdmin && promotion.cancelRequested
                                                    && promotion.status === PromotedMessageStatus.PENDING && (
                                                    <Badge
                                                        className="px-2.5 py-0.5 font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300">
                                                        Cancel requested
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetailsClick(promotion.id)}
                                            >
                                                View Details
                                                <Eye className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

function formatDate(d: string | null | undefined) {
    if (!d) return "-"
    const date = new Date(d)
    if (isNaN(date.getTime())) return d || "-"
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}
