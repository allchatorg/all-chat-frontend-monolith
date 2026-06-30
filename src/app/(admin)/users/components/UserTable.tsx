import {Role} from "@/models/Role";
import {User} from "@/models/User";
import {useEffect, useState} from "react";
import {ChevronDown, Filter} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import PaginationFooter from "@/components/PaginationFooter";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    VisibilityState,
} from "@tanstack/table-core";
import {flexRender, useReactTable} from "@tanstack/react-table";
import {UserSearchRequest} from "@/models/UserSearchRequest";
import {useUserTableColumns} from "@/lib/hooks/useUserTableColumns";
import {useRouter} from "next/navigation";
import {useIsMobile} from "@/lib/hooks/useIsMobile";


interface Props {
    onSearchParamsChange: (params: UserSearchRequest) => void;
    isLoading: boolean;
    totalPages: number;
    currentPage: number;
    content: User[];
    onRoleChange: (user: User, newRole: Role) => void;
}

const PAGE_SIZE = 10;
const UserTable: React.FC<Props> = ({
                                        onSearchParamsChange,
                                        content,
                                        isLoading,
                                        totalPages,
                                        currentPage,
                                        onRoleChange
                                    }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isMobile) {
            setColumnVisibility((prev) => ({
                ...prev,
                email: false,
                isOver18: false,
                claimed: false,
                verified: false,
            }));
        } else {
            setColumnVisibility((prev) => ({
                ...prev,
                email: true,
                isOver18: true,
                claimed: true,
                verified: true,
            }));
        }
    }, [isMobile]);

    const tableColumnsTest = useUserTableColumns({
        onRoleChange: (user, newRole) => {
            onRoleChange(user, newRole);
        }
    });

    const router = useRouter();

    const table = useReactTable({
        data: content ?? [],
        columns: tableColumnsTest,
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

    const over18Col = table.getColumn("isOver18");
    const claimedCol = table.getColumn("claimed");
    const verifiedCol = table.getColumn("verified");
    const roleCol = table.getColumn("role");

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        const params = getCurrentParams();
        params.page = page - 1; // Adjust for zero-based index
        onSearchParamsChange(params);
    };

    useEffect(() => {
        const params = getCurrentParams();
        params.page = 0;
        onSearchParamsChange(params);
    }, [sorting, columnFilters]);

    const getCurrentParams = () => {
        const roleFilter = table.getColumn("role")?.getFilterValue() as Role[] | undefined;
        const usernameOrId = table.getColumn("username")?.getFilterValue() as string | undefined;
        const page = currentPage - 1;
        const size = PAGE_SIZE;
        const over18 = over18Col?.getFilterValue() as boolean | undefined;
        const claimed = claimedCol?.getFilterValue() as boolean | undefined;
        const verified = verifiedCol?.getFilterValue() as boolean | undefined;

        const sortDtos = sorting.map(s => ({
            field: s.id,
            direction: s.desc ? "DESC" : "ASC"
        }));

        const params: UserSearchRequest = {
            roles: roleFilter ?? [],
            usernameOrId,
            over18,
            verified,
            claimed,
            page,
            size,
            sort: JSON.stringify(sortDtos)
        };
        return params;
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-3 py-4">
                <Input
                    placeholder="Filter usernames..."
                    value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        table.getColumn("username")?.setFilterValue(value);
                    }}
                    className="max-w-sm"
                />

                {isMobile ? (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="ml-auto">
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>
                                    Apply filters to refine user search results.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Over 18</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={over18Col?.getFilterValue() === undefined ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => over18Col?.setFilterValue(undefined)}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={over18Col?.getFilterValue() === true ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => over18Col?.setFilterValue(true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant={over18Col?.getFilterValue() === false ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => over18Col?.setFilterValue(false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Claimed</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={claimedCol?.getFilterValue() === undefined ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => claimedCol?.setFilterValue(undefined)}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={claimedCol?.getFilterValue() === true ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => claimedCol?.setFilterValue(true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant={claimedCol?.getFilterValue() === false ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => claimedCol?.setFilterValue(false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Verified</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={verifiedCol?.getFilterValue() === undefined ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => verifiedCol?.setFilterValue(undefined)}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={verifiedCol?.getFilterValue() === true ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => verifiedCol?.setFilterValue(true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant={verifiedCol?.getFilterValue() === false ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => verifiedCol?.setFilterValue(false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Role</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={roleCol?.getFilterValue() === undefined ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => roleCol?.setFilterValue(undefined)}
                                        >
                                            All
                                        </Button>
                                        {Object.values(Role)
                                            .filter((r) => typeof r === "string")
                                            .map((r) => {
                                                const selected = ((roleCol?.getFilterValue() as string[]) ?? []).includes(r as string);
                                                return (
                                                    <Button
                                                        key={r as string}
                                                        variant={selected ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => {
                                                            const current = (roleCol?.getFilterValue() as string[] | undefined) ?? [];
                                                            const next = selected ? current.filter((s) => s !== r) : [...current, r as string];
                                                            roleCol?.setFilterValue(next.length ? next : undefined);
                                                        }}
                                                        className="capitalize"
                                                    >
                                                        {r as string}
                                                    </Button>
                                                );
                                            })}
                                    </div>
                                </div>
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
                                                        {column.id}
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
                                        table.getColumn("username")?.setFilterValue("");
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <>
                        <div className="ml-4 flex items-center gap-2">
                            {/* Over 18 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"
                                            className={`h-8 ${over18Col?.getFilterValue() !== undefined ? "ring-2 ring-offset-1" : ""}`}>
                                        Over 18
                                        <ChevronDown className="ml-2"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter Over 18</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem
                                        checked={over18Col?.getFilterValue() === undefined}
                                        onCheckedChange={(checked) => {
                                            if (checked) over18Col?.setFilterValue(undefined);
                                        }}
                                    >
                                        All
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={over18Col?.getFilterValue() === true}
                                        onCheckedChange={(checked) => {
                                            over18Col?.setFilterValue(checked ? true : undefined);
                                        }}
                                    >
                                        Yes
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={over18Col?.getFilterValue() === false}
                                        onCheckedChange={(checked) => {
                                            over18Col?.setFilterValue(checked ? false : undefined);
                                        }}
                                    >
                                        No
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Claimed - Updated with checkmarks */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"
                                            className={`h-8 ${claimedCol?.getFilterValue() !== undefined ? "ring-2 ring-offset-1" : ""}`}>
                                        Claimed
                                        <ChevronDown className="ml-2"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter Claimed</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem
                                        checked={claimedCol?.getFilterValue() === undefined}
                                        onCheckedChange={(checked) => {
                                            if (checked) claimedCol?.setFilterValue(undefined);
                                        }}
                                    >
                                        All
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={claimedCol?.getFilterValue() === true}
                                        onCheckedChange={(checked) => {
                                            claimedCol?.setFilterValue(checked ? true : undefined);
                                        }}
                                    >
                                        Yes
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={claimedCol?.getFilterValue() === false}
                                        onCheckedChange={(checked) => {
                                            claimedCol?.setFilterValue(checked ? false : undefined);
                                        }}
                                    >
                                        No
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"
                                            className={`h-8 ${verifiedCol?.getFilterValue() !== undefined ? "ring-2 ring-offset-1" : ""}`}>
                                        Verified
                                        <ChevronDown className="ml-2"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter Verified</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem
                                        checked={verifiedCol?.getFilterValue() === undefined}
                                        onCheckedChange={(checked) => {
                                            if (checked) verifiedCol?.setFilterValue(undefined);
                                        }}
                                    >
                                        All
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={verifiedCol?.getFilterValue() === true}
                                        onCheckedChange={(checked) => {
                                            verifiedCol?.setFilterValue(checked ? true : undefined);
                                        }}
                                    >
                                        Yes
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={verifiedCol?.getFilterValue() === false}
                                        onCheckedChange={(checked) => {
                                            verifiedCol?.setFilterValue(checked ? false : undefined);
                                        }}
                                    >
                                        No
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`h-8 ${(roleCol?.getFilterValue() as string[] | undefined)?.length ? "ring-2 ring-offset-1" : ""}`}
                                    >
                                        Role
                                        <ChevronDown className="ml-2"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Filter Role</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem
                                        checked={roleCol?.getFilterValue() === undefined}
                                        onClick={() => roleCol?.setFilterValue(undefined)}>All</DropdownMenuCheckboxItem>
                                    {Object.values(Role)
                                        .filter((r) => typeof r === "string")
                                        .map((r) => {
                                            const selected = ((roleCol?.getFilterValue() as string[]) ?? []).includes(r as string);
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={r as string}
                                                    checked={selected}
                                                    onCheckedChange={(checked) => {
                                                        const current = (roleCol?.getFilterValue() as string[] | undefined) ?? [];
                                                        const next = checked ? [...current, r as string] : current.filter((s) => s !== r);
                                                        roleCol?.setFilterValue(next.length ? next : undefined);
                                                    }}
                                                    className="capitalize"
                                                >
                                                    {r as string}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Button
                            variant="ghost"
                            className="ml-auto"
                            onClick={() => {
                                table.resetColumnFilters();
                                table.getColumn("username")?.setFilterValue("");
                            }}
                        >
                            Clear filters
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-2">
                                    Columns <ChevronDown/>
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
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>

            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}
                                          onClick={() => {
                                              const user = row.original;
                                              router.push(`/users/${user.id}/details`);
                                          }}
                                          className="cursor-pointer">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumnsTest.length} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-auto">
                <PaginationFooter totalPages={totalPages}
                                  currentPage={currentPage}
                                  onPageChange={handlePageChange}/>
            </div>
        </div>
    );
}

export default UserTable;
