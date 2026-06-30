"use client"
import {Suspense, useMemo, useState} from 'react';
import {useGetUsersQuery} from "@ads/store/services/adminUsersApi"
import {SiteHeader} from "@ads/components/site-header"
import {UsersTable} from "@ads/components/users-table"
import {useUsersParams} from "@ads/hooks/use-users-params"
import {sortParamsToQueryString} from "@ads/lib/utils"
import {useDebounce} from "@ads/hooks/useDebounce"

function AdminUsersPageContent() {
    const [page, setPage] = useState(0)
    const [size] = useState(10)

    const {
        sort,
        searchQuery,
        setSort,
        setSearchQuery,
        clearParams
    } = useUsersParams()

    // Local search state for immediate UI updates
    const [localSearch, setLocalSearch] = useState(searchQuery || "")

    // Debounced search value
    const debouncedSearch = useDebounce(localSearch)

    // Parse search query to determine if it's a User ID or Email
    const {userId, email} = useMemo(() => {
        if (!debouncedSearch) return {userId: undefined, email: undefined}

        const isNumeric = /^\d+$/.test(debouncedSearch)
        if (isNumeric) {
            return {userId: parseInt(debouncedSearch), email: undefined}
        }
        return {userId: undefined, email: debouncedSearch}
    }, [debouncedSearch])

    const formattedSort = useMemo(() => {
        if (!sort) return undefined
        const [field, direction] = sort.split(",")
        return sortParamsToQueryString([{
            id: field,
            desc: direction === "desc"
        }])
    }, [sort])

    const {data} = useGetUsersQuery({
        page,
        size,
        sort: formattedSort,
        userId,
        email
    })

    const users = data?.content || []
    const totalPages = data?.totalPages || 0

    return (
        <div className="w-full px-4 lg:px-6 py-4 md:gap-6 md:py-6">
            <UsersTable
                users={users}
                sort={sort}
                onSortChange={setSort}
                searchQuery={localSearch}
                onSearchQueryChange={setLocalSearch}
                onClearFilters={() => {
                    setLocalSearch("")
                    clearParams()
                }}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    )
}

export default function AdminUsersPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="Users Management"
                description="Manage platform users and view their activity"
            />
            <Suspense fallback={<div>Loading...</div>}>
                <AdminUsersPageContent/>
            </Suspense>
        </div>
    )
}
