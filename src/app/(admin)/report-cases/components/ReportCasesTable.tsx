"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {ChevronDown, Filter} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import PaginationFooter from "@/components/PaginationFooter";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    VisibilityState,
} from "@tanstack/table-core";
import {ColumnSort, flexRender, useReactTable} from "@tanstack/react-table";
import {ReportCaseSummary} from "@/models/ReportCaseSummary";
import {useReportCasesTableColumns} from "@/lib/hooks/useReportCasesTableColumns";
import {useReportCaseFilters} from "@/lib/hooks/useReportCaseFilters";
import {useDebounce} from "@/lib/hooks/useDebounce";
import {ReportSearchRequest} from "@/models/ReportSearchRequest";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ROUTES} from "@/routes";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

interface Props {
    isLoading: boolean,
    totalPages: number,
    content: ReportCaseSummary[],
    handleSearchParamsChange: (params: ReportSearchRequest) => void
}

const PAGE_SIZE = 10;

export function ReportCasesTable({
                                     content,
                                     isLoading,
                                     totalPages,
                                     handleSearchParamsChange
                                 }: Props) {
    const {filters, setFilters} = useReportCaseFilters();
    const isMobile = useIsMobile();

    const [sorting, setSorting] = useState<SortingState>(filters.sort ? filters.sort : [])

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [localSearch, setLocalSearch] = useState(filters.reportedUserUsernameOrId);

    const debouncedSearch = useDebounce(localSearch);

    const router = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.toString();
    const returnTo = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
    const getReportCaseHref = (reportCaseId: string | number) =>
        `${ROUTES.REPORTS}/${reportCaseId}?returnTo=${encodeURIComponent(returnTo)}`;

    useEffect(() => {
        if (isMobile) {
            setColumnVisibility({
                "needsAttention": false,
                "reportCount": false,
                "message.content": false,
                "message.sender.username": true,
                "isResolved": true,
                "viewDetails": true
            });
        } else {
            setColumnVisibility({});
        }
    }, [isMobile]);

    useEffect(() => {

        const updatedParams = {
            ...filters,
            page: 1,
            reportedUserUsernameOrId: debouncedSearch || undefined,
            sort: sortParamsToQueryString(sorting),
        }

        setFilters({
            ...filters,
            page: 1,
            reportedUserUsernameOrId: debouncedSearch || undefined,
            sort: sorting,
        })

        handleSearchParamsChange(updatedParams);
    }, [debouncedSearch, filters.resolved, sorting]);


    const tableColumns = useReportCasesTableColumns({
        onViewDetails: (reportCaseId: string) => {
            router.push(getReportCaseHref(reportCaseId));
        }
    });

    const table = useReactTable({
        data: content ?? [],
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const senderCol = table.getColumn("message.sender.username");

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        setFilters({
            ...filters,
            page: newPage,
        });

        const updatedParams = {
            ...filters,
            page: newPage,
        }

        handleSearchParamsChange({
            ...updatedParams,
            sort: sortParamsToQueryString(sorting),
        });
    }

    const sortParamsToQueryString = (sorting: ColumnSort[]) => {
        const mappedSorting = sorting.map(item => ({
            field: item.id,
            direction: item.desc ? "DESC" : "ASC",
        }))

        return mappedSorting.length > 0 ? encodeURIComponent(JSON.stringify(mappedSorting)) : undefined;
    }


    return (
        <div className="flex h-full w-full flex-col">
            <div className={`flex items-center gap-3 py-4`}>
                <Input
                    placeholder="Filter by sender username or id..."
                    value={localSearch ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        senderCol?.setFilterValue(value);
                        setLocalSearch(value);
                    }}
                    className={isMobile ? "w-full" : "max-w-sm"}
                />

                {isMobile ? (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="ml-auto shrink-0">
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>
                                    Apply filters to refine report cases.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Columns</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => {
                                                const isVisible = column.getIsVisible();
                                                return (
                                                    <Button
                                                        key={column.id}
                                                        variant={isVisible ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => column.toggleVisibility(!isVisible)}
                                                        className="capitalize"
                                                    >
                                                        {column.columnDef.header && typeof column.columnDef.header === 'string'
                                                            ? column.columnDef.header
                                                            : column.id === "message.sender.username" ? "Sender"
                                                                : column.id === "message.content" ? "Message"
                                                                    : column.id}
                                                    </Button>
                                                );
                                            })}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        table.resetColumnFilters();
                                        setLocalSearch("");
                                        senderCol?.setFilterValue("");
                                        setFilters({
                                            ...filters,
                                            page: 1
                                        });
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <div className="ml-auto flex gap-2">
                        <Button
                            variant="ghost"
                            className="ml-auto"
                            onClick={() => {
                                table.resetColumnFilters();
                                setLocalSearch("");
                                senderCol?.setFilterValue("");
                                setFilters({
                                    ...filters,
                                    page: 1
                                });
                            }}
                        >
                            Clear filters
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-2">
                                    Columns <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id === "message.sender.username" ? "Sender" : column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <div className="rounded-md border overflow-hidden flex-1">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        onClick={() => router.push(getReportCaseHref(row.original.id))}
                                        className="cursor-pointer"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={tableColumns.length}
                                        className="h-24 text-center"
                                    >
                                        {isLoading ? "Loading..." : "No report cases found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="mt-4">
                <PaginationFooter
                    totalPages={totalPages}
                    currentPage={filters.page}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
