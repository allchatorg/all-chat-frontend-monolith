import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export type ColumnSort = {
    id: string
    desc: boolean
}

export function sortParamsToQueryString(sorting: ColumnSort[]) {
    const mappedSorting = sorting.map((item) => ({
        field: item.id,
        direction: item.desc ? "DESC" : "ASC",
    }))

    return mappedSorting.length > 0
        ? encodeURIComponent(JSON.stringify(mappedSorting))
        : undefined
}
