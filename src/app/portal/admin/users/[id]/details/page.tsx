"use client";
import {useParams} from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {useGetUserByIdQuery} from "@ads/store/services/adminUsersApi";
import {UserRole} from "@ads/models/user-role";

export default function UserDetailsPage() {
    const params = useParams();
    const userId = Number(params.id);

    const {data: user, isLoading} = useGetUserByIdQuery(userId, {
        skip: isNaN(userId),
    });

    if (isLoading) {
        return <div>Loading user details...</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Basic details about this user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-base font-semibold">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-base font-semibold">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                            <p className="text-base font-mono text-sm">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <Badge variant={user.role === UserRole.ADMIN ? 'default' : 'secondary'}
                                   className="capitalize">
                                {user.role}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                            <p className="text-base font-semibold">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                    <CardDescription>User&apos;s advertising activity on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                            <p className="text-3xl font-bold text-blue-600">{user.totalPurchasedAdsCount}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total Ads Purchased</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                            <p className="text-3xl font-bold text-green-600">${(user.totalSpent && user.totalSpent.toFixed(2))}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total Spent</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
