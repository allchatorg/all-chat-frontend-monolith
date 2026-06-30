"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useCallback} from "react"

export interface UsersParams {
    sort: string
    searchQuery: string
}

export function useUsersParams() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === null || value === "") {
                params.delete(name)
            } else {
                params.set(name, value)
            }
            return params.toString()
        },
        [searchParams]
    )

    const setParam = useCallback(
        (name: string, value: string | null) => {
            router.push(pathname + "?" + createQueryString(name, value))
        },
        [router, pathname, createQueryString]
    )

    const sort = searchParams.get("sort") || "totalSpent,desc"
    const searchQuery = searchParams.get("search") || ""

    return {
        sort,
        searchQuery,

        setSort: (val: string) => setParam("sort", val),
        setSearchQuery: (val: string) => setParam("search", val || null),

        clearParams: () => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("sort")
            params.delete("search")
            router.push(pathname + "?" + params.toString())
        }
    }
}
