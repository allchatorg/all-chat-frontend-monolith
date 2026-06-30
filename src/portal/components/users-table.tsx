"use client"

import * as React from "react"
import {Badge} from "@ads/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ads/components/ui/table"
import {Button} from "@ads/components/ui/button"
import {Input} from "@ads/components/ui/input"
import {ArrowUpDown, Eye, Search, X} from "lucide-react"
import {useRouter} from "next/navigation"
import {AdminUserDto} from "@ads/models/admin-user"
import {UserRole} from "@ads/models/user-role"

interface UsersTableProps {
    users: AdminUserDto[]
    sort: string
    onSortChange: (value: string) => void
    searchQuery: string
    onSearchQueryChange: (value: string) => void
    onClearFilters: () => void
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function UsersTable({
                               users,
                               sort,
                               onSortChange,
                               searchQuery,
                               onSearchQueryChange,
                               onClearFilters,
                               page,
                               totalPages,
                               onPageChange
                           }: UsersTableProps) {
    const router = useRouter()

    const toggleSort = (field: string) => {
        if (!onSortChange) return
        const [currentField, currentOrder] = sort.split(",")

        if (currentField === field) {
            onSortChange(`${field},${currentOrder === "asc" ? "desc" : "asc"}`)
        } else {
            onSortChange(`${field},desc`)
        }
    }

    const hasFilters = !!searchQuery

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 pb-2">
                <div className="relative flex-1 w-full lg:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        placeholder="Search by email or user ID..."
                        value={searchQuery || ""}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="h-9 pl-9 w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {hasFilters && (
                        <Button variant="ghost" onClick={onClearFilters} className="h-8 px-2 lg:px-3">
                            Reset
                            <X className="ml-2 h-4 w-4"/>
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">
                                Ads Purchased
                                {/* <Button
                                    variant="ghost"
                                    onClick={() => toggleSort("totalPurchasedAdsCount")}
                                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                                >
                                    Ads Purchased
                                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                                </Button> */}
                            </TableHead>
                            <TableHead className="text-right">
                                <Button
                                    variant="ghost"
                                    onClick={() => toggleSort("totalSpent")}
                                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                                >
                                    Total Spent
                                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                                        <Search className="w-12 h-12 text-muted-foreground/50"/>
                                        <p className="font-medium text-muted-foreground">No users found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{user.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === UserRole.ADMIN ? 'default' : 'secondary'}
                                               className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{user.totalPurchasedAdsCount}</TableCell>
                                    <TableCell
                                        className="text-right font-semibold">${user.totalSpent.toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/portal/admin/users/${user.id}`)}
                                        >
                                            View Profile
                                            <Eye className="ml-2 h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {Math.max(1, totalPages)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
