"use client"

import * as React from "react"
import {Badge} from "@ads/components/ui/badge"
import {Tabs, TabsList, TabsTrigger} from "@ads/components/ui/tabs"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ads/components/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ads/components/ui/select"
import {Button} from "@ads/components/ui/button"
import {Input} from "@ads/components/ui/input"
import {ArrowUpDown, Eye, Rocket, Search} from "lucide-react"
import {useRouter} from "next/navigation"
import {RoomPromotion, RoomPromotionStatus} from "@ads/models/room-promotion"

export type RoomPromotionStatusFilter = RoomPromotionStatus | "ALL"

const STATUS_TABS: { value: RoomPromotionStatusFilter; label: string }[] = [
    {value: "ALL", label: "All"},
    {value: RoomPromotionStatus.PENDING, label: "Pending"},
    {value: RoomPromotionStatus.APPROVED, label: "Approved"},
    {value: RoomPromotionStatus.DENIED, label: "Denied"},
    {value: RoomPromotionStatus.CANCELED, label: "Canceled"},
]

// Shared status badge coloring: PENDING amber / APPROVED green / DENIED red / CANCELED gray
// (same palette as getPromotionStatusBadgeClass for promoted messages).
export function getRoomPromotionStatusBadgeClass(status: RoomPromotionStatus): string {
    switch (status) {
        case RoomPromotionStatus.PENDING:
            return "bg-amber-500 hover:bg-amber-600 text-white"
        case RoomPromotionStatus.APPROVED:
            return "bg-green-500 hover:bg-green-600 text-white"
        case RoomPromotionStatus.DENIED:
            return "bg-red-500 hover:bg-red-600 text-white"
        case RoomPromotionStatus.CANCELED:
            return "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700"
        default:
            return "bg-secondary"
    }
}

interface RoomPromotionsTableProps {
    promotions: RoomPromotion[]
    status: RoomPromotionStatusFilter
    onStatusChange: (status: RoomPromotionStatusFilter) => void
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    isAdmin?: boolean
    // Overrides the isAdmin-based detail route, e.g. an admin page that hides the admin columns
    viewDetailsPath?: string
    // Per-status totals shown as badges on the filter tabs; badges are hidden when omitted
    counts?: Partial<Record<RoomPromotionStatusFilter, number>>
    // Admin-only: debounced email/userId search + submittedAt sort toggle
    searchQuery?: string
    onSearchQueryChange?: (value: string) => void
    sort?: string
    onSortChange?: (value: string) => void
}

// Clone of promoted-messages-table.tsx for room promotions (no message column,
// plus an Approved date column since approved room promotions never expire).
export function RoomPromotionsTable({
                                        promotions,
                                        status,
                                        onStatusChange,
                                        page,
                                        totalPages,
                                        onPageChange,
                                        isAdmin = false,
                                        viewDetailsPath,
                                        counts,
                                        searchQuery,
                                        onSearchQueryChange,
                                        sort,
                                        onSortChange,
                                    }: RoomPromotionsTableProps) {
    const router = useRouter()

    const toggleSort = () => {
        if (!onSortChange || !sort) return
        const [, order] = sort.split(",")
        onSortChange(`submittedAt,${order === "asc" ? "desc" : "asc"}`)
    }

    const handleViewDetailsClick = (id: number) => {
        const base = viewDetailsPath ?? (isAdmin ? "/portal/admin/room-promotions" : "/portal/room-promotions")
        router.push(`${base}/${id}`)
    }

    return (
        <div className="space-y-4">
            <Tabs
                value={status}
                onValueChange={(val) => onStatusChange(val as RoomPromotionStatusFilter)}
                className="w-full"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Select
                        value={status}
                        onValueChange={(val) => onStatusChange(val as RoomPromotionStatusFilter)}
                    >
                        <SelectTrigger className="w-[170px] lg:hidden">
                            <SelectValue placeholder="Filter by Status"/>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_TABS.map((tab) => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    {tab.value === "ALL" ? "All Statuses" : tab.label}
                                    {counts && ` (${counts[tab.value] || 0})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <TabsList className="hidden lg:flex h-9">
                        {STATUS_TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                                {counts && (
                                    <Badge variant="secondary" className="ml-2 rounded-full px-1">
                                        {counts[tab.value] || 0}
                                    </Badge>
                                )}
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
                                <TableHead>Approved</TableHead>
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
                                            <Rocket className="w-12 h-12 text-muted-foreground/50"/>
                                            <p className="font-medium text-muted-foreground">No room promotions
                                                found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promotion) => (
                                    <TableRow key={promotion.id}>
                                        <TableCell className="max-w-[280px]">
                                            <span className="line-clamp-2 break-words text-sm font-medium">
                                                {promotion.chatRoomName}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">${promotion.amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(promotion.submittedAt)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(promotion.approvedAt)}
                                        </TableCell>
                                        {isAdmin && <TableCell>{promotion.email}</TableCell>}
                                        {isAdmin &&
                                            <TableCell className="text-muted-foreground">{promotion.userId}</TableCell>}
                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1">
                                                <Badge
                                                    className={`px-2.5 py-0.5 capitalize font-medium ${getRoomPromotionStatusBadgeClass(promotion.status)}`}>
                                                    {promotion.status}
                                                </Badge>
                                                {isAdmin && promotion.cancelRequested
                                                    && promotion.status === RoomPromotionStatus.PENDING && (
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
