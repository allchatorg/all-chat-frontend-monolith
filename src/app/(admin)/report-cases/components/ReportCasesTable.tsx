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
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
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
import {ReportType} from "@/models/ReportTypeEnum";
import {ReportSeverity} from "@/models/ReportSeverity";
import {ReportAssignmentFilter} from "@/models/ReportAssignmentFilter";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {ReportCasesSearchFilters} from "@/app/(admin)/report-cases/components/ReportCasesSearchFilters";
import {
    filterableReportTypes,
    getReportTypeLabel,
    reportSeverityLabels,
    reportTypeSeverity
} from "@/lib/reportUtils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {useThunk} from "@/lib/hooks/useThunk";
import {claimCaseThunk} from "@/redux/report-cases/reportCasesThunk";
import {toast} from "sonner";

interface Props {
    isLoading: boolean,
    totalPages: number,
    content: ReportCaseSummary[],
    handleSearchParamsChange: (params: ReportSearchRequest) => void
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const assignmentLabels: Record<ReportAssignmentFilter, string> = {
    [ReportAssignmentFilter.MINE]: "Claimed by me",
    [ReportAssignmentFilter.UNASSIGNED]: "Unclaimed",
};

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
                "underage": false,
                "reportCount": false,
                "message_content": false,
                "assignee": false,
                "message.sender.username": true,
                "isResolved": false,
                "severity": true,
                "timer": true,
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


    const currentUser = useSelector(selectUser);
    const {isAdmin} = useRoleAccess();
    const [claimCase] = useThunk(claimCaseThunk);

    const handleClaim = async (reportCaseId: number) => {
        try {
            await claimCase(reportCaseId);
            toast.success("Case claimed");
        } catch (error) {
            toast.error(error instanceof Error && error.message ? error.message : "Failed to claim the case");
        }

        // Also after a failure: someone else's claim is why it failed, and the list should show it.
        handleSearchParamsChange({...filters, sort: sortParamsToQueryString(sorting)});
    };

    const tableColumns = useReportCasesTableColumns({
        onViewDetails: (reportCaseId: string) => {
            router.push(getReportCaseHref(reportCaseId));
        },
        onClaim: handleClaim,
        currentUserId: currentUser?.id,
    });

    const table = useReactTable({
        data: content ?? [],
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
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

    const selectedReportTypes = filters.reportTypes ?? [];
    const selectedSeverities = filters.severities ?? [];
    const underageFilterActive = selectedReportTypes.includes(ReportType.UNDERAGE);

    const applyFilters = (changes: Partial<ReportCasesSearchFilters>) => {
        const updatedFilters = {
            ...filters,
            ...changes,
            page: 1,
        };

        setFilters(updatedFilters);

        handleSearchParamsChange({
            ...updatedFilters,
            sort: sortParamsToQueryString(sorting),
        });
    };

    const toggleReportType = (type: ReportType) => {
        const reportTypes = selectedReportTypes.includes(type)
            ? selectedReportTypes.filter(selected => selected !== type)
            : [...selectedReportTypes, type];
        applyFilters({reportTypes: reportTypes.length > 0 ? reportTypes : undefined});
    };

    const toggleSeverity = (severity: ReportSeverity) => {
        const severities = selectedSeverities.includes(severity)
            ? selectedSeverities.filter(selected => selected !== severity)
            : [...selectedSeverities, severity];
        applyFilters({severities: severities.length > 0 ? severities : undefined});
    };

    const toggleUnderageFilter = () => toggleReportType(ReportType.UNDERAGE);

    // That view spans both tabs, so leaving it goes back to the tab in the URL.
    const toggleNcmecDecisionPending = () => applyFilters(filters.ncmecDecisionPending
        ? {ncmecDecisionPending: undefined, resolved: searchParams.get("resolved") === "true"}
        : {ncmecDecisionPending: true, resolved: undefined});

    const clearAllFilters = () => {
        table.resetColumnFilters();
        setLocalSearch("");
        senderCol?.setFilterValue("");

        const updatedFilters = {
            ...filters,
            page: 1,
            reportTypes: undefined,
            severities: undefined,
            assignment: undefined,
            reportedUserUsernameOrId: undefined,
            ncmecDecisionPending: undefined,
            resolved: searchParams.get("resolved") === "true",
        };

        setFilters(updatedFilters);

        handleSearchParamsChange({
            ...updatedFilters,
            sort: sortParamsToQueryString(sorting),
        });
    };

    const assignmentMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={filters.assignment ? "default" : "outline"} size={isMobile ? "sm" : "default"}>
                    {filters.assignment ? assignmentLabels[filters.assignment] : "Assignee"}
                    <ChevronDown className="ml-2 h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.values(ReportAssignmentFilter).map((assignment) => (
                    <DropdownMenuCheckboxItem
                        key={assignment}
                        checked={filters.assignment === assignment}
                        onCheckedChange={() => applyFilters({
                            assignment: filters.assignment === assignment ? undefined : assignment
                        })}
                    >
                        {assignmentLabels[assignment]}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // A case's severity is that of its most serious report; the type filter matches any report.
    const severityMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={selectedSeverities.length > 0 ? "default" : "outline"} size={isMobile ? "sm" : "default"}>
                    Severity{selectedSeverities.length > 0 ? ` (${selectedSeverities.length})` : ""}
                    <ChevronDown className="ml-2 h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.values(ReportSeverity).map((severity) => (
                    <DropdownMenuCheckboxItem
                        key={severity}
                        checked={selectedSeverities.includes(severity)}
                        onCheckedChange={() => toggleSeverity(severity)}
                        onSelect={(event) => event.preventDefault()}
                    >
                        {reportSeverityLabels[severity]}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const reportTypeMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={selectedReportTypes.length > 0 ? "default" : "outline"} size={isMobile ? "sm" : "default"}>
                    Report type{selectedReportTypes.length > 0 ? ` (${selectedReportTypes.length})` : ""}
                    <ChevronDown className="ml-2 h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {Object.values(ReportSeverity).map((severity, index) => (
                    <DropdownMenuGroup key={severity}>
                        {index > 0 && <DropdownMenuSeparator/>}
                        <DropdownMenuLabel>{reportSeverityLabels[severity]}</DropdownMenuLabel>
                        {filterableReportTypes
                            .filter((type) => reportTypeSeverity[type] === severity)
                            .map((type) => (
                                <DropdownMenuCheckboxItem
                                    key={type}
                                    checked={selectedReportTypes.includes(type)}
                                    onCheckedChange={() => toggleReportType(type)}
                                    onSelect={(event) => event.preventDefault()}
                                >
                                    {getReportTypeLabel(type)}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuGroup>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Only admins and super admins can make this decision.
    const ncmecDecisionFilter = isAdmin() && (
        <Button
            variant={filters.ncmecDecisionPending ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={toggleNcmecDecisionPending}
        >
            Needs NCMEC decision
        </Button>
    );

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
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Severity and report type</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {assignmentMenu}
                                        {severityMenu}
                                        {reportTypeMenu}
                                        <Button
                                            variant={underageFilterActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={toggleUnderageFilter}
                                        >
                                            Underage
                                        </Button>
                                        {ncmecDecisionFilter}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={clearAllFilters}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <div className="ml-auto flex flex-wrap justify-end gap-2">
                        {assignmentMenu}
                        {severityMenu}
                        {reportTypeMenu}
                        <Button
                            variant={underageFilterActive ? "default" : "outline"}
                            onClick={toggleUnderageFilter}
                        >
                            Underage
                        </Button>
                        {ncmecDecisionFilter}

                        <Button
                            variant="ghost"
                            className="ml-auto"
                            onClick={clearAllFilters}
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

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <PaginationFooter
                        totalPages={totalPages}
                        currentPage={filters.page}
                        onPageChange={handlePageChange}
                    />
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Per page</span>
                    <Select value={String(filters.size)} onValueChange={(size) => applyFilters({size: Number(size)})}>
                        <SelectTrigger className="w-20" aria-label="Cases per page">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {[...new Set([...PAGE_SIZE_OPTIONS, filters.size])].sort((a, b) => a - b).map((size) => (
                                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
