import {useMemo} from "react";
import {ColumnDef} from "@tanstack/table-core";
import {User} from "@/models/User";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {canActOn, hasPermission, Role} from "@/models/Role";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {Permission} from "@/models/Permission";
import {useRouter} from "next/navigation";
import {formatFileSize} from "@/lib/utils";

const availableRoles: Role[] = Object.values(Role).filter(
    role => role !== Role.GUEST && role !== Role.UNCLAIMED_USER && role !== Role.SUPER_ADMIN
);

type UseUserTableColumnsProps = {
    onRoleChange: (user: User, newRole: Role) => void;
};

export function useUserTableColumns({
                                        onRoleChange
                                    }: UseUserTableColumnsProps): ColumnDef<User>[] {
    const userRoles = useRoleAccess();
    const router = useRouter();

    return useMemo(() => {
        return [
            {
                accessorKey: "username",
                header: ({column}) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Username
                        <ArrowUpDown className="ml-2"/>
                    </Button>
                ),
                cell: ({row}) => (
                    <div className="font-medium">{row.getValue("username")}</div>
                )
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({row}) => {
                    const email = row.getValue("email") as string | null;
                    return <div className="lowercase">{email || "N/A"}</div>;
                }
            },
            {
                accessorKey: "totalUploadUsage",
                header: ({column}) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Total Upload Usage
                        <ArrowUpDown className="ml-2"/>
                    </Button>
                ),
                cell: ({row}) => {
                    const usage = row.getValue("totalUploadUsage") as number;
                    return <div className="font-medium">{formatFileSize(usage || 0)}</div>;
                }
            },
            {
                accessorKey: "isOver18",
                header: "Over 18",
                cell: ({row}) => {
                    const isOver18 = row.getValue("isOver18") as boolean;
                    return (
                        <div
                            className={`capitalize ${isOver18 ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {isOver18 ? "Yes" : "No"}
                        </div>
                    );
                },
                filterFn: (row, columnId, filterValue: any) => {
                    if (filterValue === undefined) return true;
                    return row.getValue<boolean>(columnId) === filterValue;
                }
            },
            {
                accessorKey: "claimed",
                header: "Claimed",
                cell: ({row}) => {
                    const claimed = row.getValue("claimed") as boolean;
                    return (
                        <div
                            className={`capitalize ${claimed ? "text-green-600" : "text-gray-600"
                            }`}
                        >
                            {claimed ? "Yes" : "No"}
                        </div>
                    );
                },
                filterFn: (row, columnId, filterValue: any) => {
                    if (filterValue === undefined) return true;
                    return row.getValue<boolean>(columnId) === filterValue;
                }
            },
            {
                accessorKey: "verified",
                header: "Verified",
                cell: ({row}) => {
                    const verified = row.getValue("verified") as boolean;
                    return (
                        <div
                            className={`capitalize ${verified ? "text-blue-600" : "text-gray-600"
                            }`}
                        >
                            {verified ? "Yes" : "No"}
                        </div>
                    );
                },
                filterFn: (row, columnId, filterValue: any) => {
                    if (filterValue === undefined) return true;
                    return row.getValue<boolean>(columnId) === filterValue;
                }
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({row}) => {
                    const role = row.getValue("role") as Role;
                    return <div className="font-medium capitalize">{role}</div>;
                },
                filterFn: (row, columnId, filterValue: any) => {
                    const selected = filterValue as string[] | undefined;
                    if (!selected || selected.length === 0) return true;
                    return selected.includes(row.getValue<string>(columnId));
                }
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({row}) => {
                    const user = row.original;
                    const assignableRoles = availableRoles;

                    const handleRoleClick = (role: Role, e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        onRoleChange(user, role);
                    };

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(user.id.toString());
                                    }}
                                >
                                    Copy user ID
                                </DropdownMenuItem>

                                {(canActOn(userRoles.currentRole, user.role)
                                        && hasPermission(userRoles.currentRole, Permission.MANAGE_ROLES))
                                    && !(user.role === Role.UNCLAIMED_USER || user.role === Role.GUEST) &&
                                    <>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                Change Role
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {assignableRoles.filter(
                                                    role => canActOn(userRoles.currentRole, role)
                                                ).map(role => (
                                                    <DropdownMenuItem
                                                        key={role}
                                                        onClick={(e) => handleRoleClick(role, e)}
                                                        className={user.role === role ? "bg-accent" : ""}
                                                    >
                                                        <span className="capitalize">
                                                            {role.toLowerCase().replace("_", " ")}
                                                        </span>
                                                        {user.role === role && (
                                                            <span className="ml-auto text-xs text-muted-foreground">
                                                                Current
                                                            </span>
                                                        )}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator/>
                                    </>
                                }

                                {canActOn(userRoles.currentRole, user.role) &&
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/users/${user.id}`);
                                        }}
                                    >
                                        View user details
                                    </DropdownMenuItem>
                                }

                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Delete user:", user);
                                    }}
                                    className="text-red-600"
                                >
                                    Delete user
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                }
            }
        ];
    }, [onRoleChange]);
}
