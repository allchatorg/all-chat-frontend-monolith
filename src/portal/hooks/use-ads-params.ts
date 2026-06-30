"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useCallback} from "react"

export interface AdsParams {
    status: string | null
    type: string | null
    sort: string
    page: number
    size: number
    startDate: Date | undefined
    endDate: Date | undefined
    searchQuery: string
}

function formatDateLocal(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export function useAdsParams() {
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

    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const sort = searchParams.get("sort") || "submittedAt,desc"
    const page = parseInt(searchParams.get("page") || "0", 10)
    const size = parseInt(searchParams.get("size") || "10", 10)

    // Admin filters
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")
    const searchQuery = searchParams.get("search") || ""

    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    return {
        status,
        type,
        sort,
        page,
        size,
        startDate,
        endDate,
        searchQuery,

        setStatus: (val: string | null) => setParam("status", val),
        setType: (val: string | null) => setParam("type", val),
        setSort: (val: string) => setParam("sort", val),
        setPage: (val: number) => setParam("page", val.toString()),
        setSize: (val: number) => setParam("size", val.toString()),

        // FIXED — uses local date, no timezone problems
        setStartDate: (date: Date | undefined) =>
            setParam("startDate", date ? formatDateLocal(date) : null),

        setEndDate: (date: Date | undefined) =>
            setParam("endDate", date ? formatDateLocal(date) : null),

        setSearchQuery: (val: string) =>
            setParam("search", val || null),

        clearParams: () => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("status")
            params.delete("type")
            params.delete("startDate")
            params.delete("endDate")
            params.delete("search")
            params.delete("page")
            params.delete("size") // also clear size/page? Or reset to default? Usually reset to default is implicit by deletion.
            router.push(pathname + "?" + params.toString())
        }
    }
}
