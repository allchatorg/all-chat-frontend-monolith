"use client"

import * as React from "react"
import {Badge} from "@ads/components/ui/badge"
import {Tabs, TabsList, TabsTrigger} from "@ads/components/ui/tabs"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ads/components/ui/table"
import {Ad, AdFormatType, AdStatus} from "@ads/models/ad"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ads/components/ui/select"
import {Button} from "@ads/components/ui/button"
import {Input} from "@ads/components/ui/input"
import {DatePicker} from "@ads/components/ui/date-picker"
import {ArrowUpDown, Eye, Search, X} from "lucide-react"
import {useRouter} from "next/navigation"

interface AdsTableProps {
    ads: Ad[]
    status?: string | null
    type?: string | null
    sort?: string
    onStatusChange?: (value: string | null) => void
    onTypeChange?: (value: string | null) => void
    onSortChange?: (value: string) => void
    onClearFilters?: () => void
    counts?: {
        all: number
        active: number
        submitted: number
        completed: number
        rejected: number
    }
    viewDetailsPath?: string
    isAdmin?: boolean
    startDate?: Date
    endDate?: Date
    searchQuery?: string
    onStartDateChange?: (date: Date | undefined) => void
    onEndDateChange?: (date: Date | undefined) => void
    onSearchQueryChange?: (value: string) => void
}

function getAllCount(counts?: { active: number; submitted: number; completed: number; rejected: number }) {
    if (!counts) return 0
    return (counts.active || 0) + (counts.submitted || 0) + (counts.completed || 0) + (counts.rejected || 0)
}

export function AdsTable({
                             ads,
                             status,
                             type,
                             sort,
                             onStatusChange,
                             onTypeChange,
                             onSortChange,
                             onClearFilters,
                             counts,
                             viewDetailsPath,
                             isAdmin = false,
                             startDate,
                             endDate,
                             searchQuery,
                             onStartDateChange,
                             onEndDateChange,
                             onSearchQueryChange
                         }: AdsTableProps) {
    const router = useRouter()

    const getStatusVariant = (status: AdStatus) => {
        switch (status) {
            case AdStatus.ACTIVE:
                return "default"
            case AdStatus.SUBMITTED:
                return "secondary"
            default:
                return "outline"
        }
    }

    const getTypeColor = (type: AdFormatType) => {
        switch (type) {
            case AdFormatType.VIDEO:
                return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
            case AdFormatType.PHOTO:
                return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            case AdFormatType.TEXT:
                return "bg-muted text-muted-foreground border-border"
            default:
                return ""
        }
    }

    const toggleSort = () => {
        if (!onSortChange || !sort) return
        const [field, order] = sort.split(",")
        if (field === "submittedAt") {
            onSortChange(`submittedAt,${order === "asc" ? "desc" : "asc"}`)
        } else {
            onSortChange("submittedAt,desc")
        }
    }

    const clearFilters = () => {
        if (onClearFilters) {
            onClearFilters()
        } else {
            if (onStatusChange) onStatusChange(null)
            if (onTypeChange) onTypeChange(null)
            if (onStartDateChange) onStartDateChange(undefined)
            if (onEndDateChange) onEndDateChange(undefined)
            if (onSearchQueryChange) onSearchQueryChange("")
        }
    }

    const hasFilters = status !== null || type !== null || !!startDate || !!endDate || !!searchQuery
    const showFilters = !!onStatusChange && !!onTypeChange

    const allCount = getAllCount(counts)

    const handleViewDetailsClick = (id: number) => {
        const path = viewDetailsPath ? `${viewDetailsPath}/${id}` : (isAdmin ? `/portal/admin/ads/${id}` : `/portal/ads/${id}`);
        router.push(path);
    }

    return (
        <div className="space-y-4">
            {showFilters && (
                <Tabs
                    defaultValue="all"
                    value={status?.toLowerCase() || "all"}
                    onValueChange={(val) => onStatusChange?.(val === "all" ? null : val.toUpperCase())}
                    className="w-full"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Select
                            value={status?.toLowerCase() || "all"}
                            onValueChange={(val) => onStatusChange?.(val === "all" ? null : val.toUpperCase())}
                        >
                            <SelectTrigger className="w-[150px] lg:hidden">
                                <SelectValue placeholder="Filter by Status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses ({allCount})</SelectItem>
                                <SelectItem value="active">Active ({counts?.active || 0})</SelectItem>
                                <SelectItem value="submitted">Submitted ({counts?.submitted || 0})</SelectItem>
                                <SelectItem value="rejected">Rejected ({counts?.rejected || 0})</SelectItem>
                                <SelectItem value="completed">Completed ({counts?.completed || 0})</SelectItem>
                            </SelectContent>
                        </Select>

                        <TabsList className="hidden lg:flex h-9">
                            <TabsTrigger value="all">
                                All <Badge variant="secondary" className="ml-2 rounded-full px-1">{allCount}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="active">
                                Active <Badge variant="secondary"
                                              className="ml-2 rounded-full px-1">{counts?.active || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="submitted">
                                Submitted <Badge variant="secondary"
                                                 className="ml-2 rounded-full px-1">{counts?.submitted || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed <Badge variant="secondary"
                                                 className="ml-2 rounded-full px-1">{counts?.completed || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="rejected">
                                Rejected <Badge variant="secondary"
                                                className="ml-2 rounded-full px-1">{counts?.rejected || 0}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        {!isAdmin && (
                            <Select
                                value={type || "all"}
                                onValueChange={(val) => onTypeChange?.(val === "all" ? null : val)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="PHOTO">Photo</SelectItem>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <div className="flex items-center gap-2">
                            {hasFilters && (
                                <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                                    Reset
                                    <X className="ml-2 h-4 w-4"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </Tabs>
            )}

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                        <DatePicker
                            value={startDate}
                            onChange={(date) => onStartDateChange?.(date)}
                            placeholder="Start Date"
                            className="w-full sm:w-[150px]"
                        />
                        <span className="hidden sm:inline text-sm text-muted-foreground">to</span>
                        <DatePicker
                            value={endDate}
                            onChange={(date) => onEndDateChange?.(date)}
                            placeholder="End Date"
                            className="w-full sm:w-[150px]"
                        />
                    </div>

                    <Select
                        value={type || "all"}
                        onValueChange={(val) => onTypeChange?.(val === "all" ? null : val)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by Type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="PHOTO">Photo</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Views Bought</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>
                                {onSortChange && sort ? (
                                    <Button
                                        variant="ghost"
                                        onClick={toggleSort}
                                        className="-ml-4 h-8 data-[state=open]:bg-accent"
                                    >
                                        Submitted Date
                                        <ArrowUpDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                ) : (
                                    "Submitted Date"
                                )}
                            </TableHead>
                            <TableHead>Start Date</TableHead>
                            {isAdmin && <TableHead>Email</TableHead>}
                            {isAdmin && <TableHead>User ID</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                                        <svg className="w-12 h-12 text-muted-foreground/50" fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                        </svg>
                                        <p className="font-medium text-muted-foreground">No ads found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ads.map((ad) => (
                                <TableRow key={ad.id || ad.title + ad.submittedDate}>
                                    <TableCell className="font-medium">{ad.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline"
                                               className={`px-2.5 py-0.5 capitalize font-medium ${getTypeColor(ad.formatType)}`}>
                                            {ad.formatType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{ad.viewsBought.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${ad.price.toFixed(2)}</TableCell>
                                    <TableCell
                                        className="text-muted-foreground">{formatDate(ad.submittedDate)}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(ad.startDate)}</TableCell>
                                    {isAdmin && <TableCell>{ad.email}</TableCell>}
                                    {isAdmin && <TableCell className="text-muted-foreground">{ad.userId}</TableCell>}
                                    <TableCell>
                                        <Badge variant={getStatusVariant(ad.status)}
                                               className="px-2.5 py-0.5 capitalize font-medium">
                                            {ad.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetailsClick(ad.id)}
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
