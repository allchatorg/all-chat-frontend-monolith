'use client';
import React, {useState} from "react";
import {Card} from "@/components/ui/card";
import {Shield} from "lucide-react";
import {UserSearchRequest} from "@/models/UserSearchRequest";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchUsersThunk, updateUserRoleThunk} from "@/redux/admin/adminThunk";
import {useSelector} from "react-redux";
import {selectUsers} from "@/redux/admin/adminSelector";
import {User} from "@/models/User";
import {Role} from "@/models/Role";
import {toast} from "sonner";
import UserTable from "@/app/(admin)/users/components/UserTable";
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {useDialog} from "@/components/providers/DialogProvider";
import {ReasonConfirmModal} from "@/components/ReasonConfirmModal";
import {apiErrorMessage} from "@/lib/apiError";

export default function MembersPage() {
    const {open, close} = useDialog();

    const [searchUsersThunkAction, searchUsersLoading, searchUsersError] = useThunk(searchUsersThunk)
    const [updateUserRole, updateUserRoleLoading, updateUserRoleError] = useThunk(updateUserRoleThunk);

    const [searchParams, setSearchParams] = useState<UserSearchRequest>({
        claimed: false,
        over18: false,
        page: 0,
        roles: [],
        size: 0,
        sort: "",
        usernameOrId: "",
        verified: false,
        banned: false
    });

    const {content = [], totalPages, number: pageIndex} = useSelector(selectUsers);

    const currentPage = () => {
        if (pageIndex === undefined || totalPages === 0 || totalPages === 1) {
            return 1;
        }
        const currentPage = pageIndex + 1;

        if (currentPage > totalPages) {
            return totalPages;
        }
        return currentPage;
    }

    const handleSearchParamsChange = (params: UserSearchRequest) => {
        const updatedParams: UserSearchRequest = {
            ...searchParams, ...params, banned: false
        }
        setSearchParams(updatedParams);
        searchUsersThunkAction(updatedParams);
    };

    const handleRoleChange = (user: User, newRole: Role) => {
        open(
            <ReasonConfirmModal
                title="Change this user's role?"
                description={`${user.username} will change from ${user.role} to ${newRole}.`}
                onClose={close}
                onConfirm={async reason => {
                    try {
                        await updateUserRole({userId: user.id, role: newRole, reason});
                        close();
                        toast.success("Role updated successfully");
                        searchUsersThunkAction(searchParams);
                    } catch (error) {
                        toast.error(apiErrorMessage(error));
                    }
                }}
            />
        );
    };

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <div className="mx-auto w-full space-y-4">
                <div className="mx-auto w-full space-y-4">
                    <AdminPageHeader
                        title="Users Management"
                        description="
                            Manage community users, view profiles, and handle administrative actions.
                        "
                        icon={Shield}
                    />
                </div>

            </div>
            <div className="h-full w-full">
                <Card className="h-full  p-2 md:p-6">
                    <UserTable onRoleChange={handleRoleChange}
                               onSearchParamsChange={handleSearchParamsChange}
                               currentPage={currentPage()}
                               totalPages={totalPages} isLoading={searchUsersLoading}
                               content={content}/>
                </Card>
            </div>
        </div>
    );
}