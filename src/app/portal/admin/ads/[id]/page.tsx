'use client'
import {SiteHeader} from "@ads/components/site-header";
import {AdDetailsStats} from "@/app/portal/ads/[id]/components/ad-details-stats";
import AdStatusDetails from "@/app/portal/ads/[id]/components/ad-status-details";
import {ActionButton} from "@ads/components/ui/action-button";
import {Card, CardContent, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {Calendar, CheckCircle, DollarSign, Loader2, Mail, Shield, TrendingUp, User} from "lucide-react";
import {RejectAdModal} from "@/app/portal/ads/[id]/components/reject-ad-modal";
import {useParams, useRouter} from "next/navigation";
import {useApproveAdMutation, useGetAdByIdQuery, useRejectAdMutation} from "@ads/store/services/adminAdsApi";
import {useGetAdDailyStatsQuery} from "@ads/store/services/adsApi";
import {useGetUserByIdQuery} from "@ads/store/services/adminUsersApi";
import {AdStatus} from "@ads/models/ad";
import {toast} from "sonner";

export default function AdminAdDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const adId = Number(params.id);

    const {data: adData, isLoading, error} = useGetAdByIdQuery(adId);
    const {data: statsData} = useGetAdDailyStatsQuery({id: adId});
    const [rejectAd, {isLoading: isRejecting}] = useRejectAdMutation();
    const [approveAd, {isLoading: isApproving}] = useApproveAdMutation();

    const {data: userData, isLoading: isUserLoading} = useGetUserByIdQuery(adData?.userId ?? 0, {
        skip: !adData?.userId,
    });

    const isPending = adData?.status === AdStatus.PENDING;

    const handleApprove = async () => {
        if (!adData) return;

        try {
            await approveAd(adData.id).unwrap();
            toast.success("Ad approved successfully");
        } catch {
            toast.error("Failed to approve the ad. Please try again.");
        }
    };

    const handleReject = async (reason: string) => {
        if (!adData) return;

        try {
            await rejectAd({
                adId: adData.id,
                rejectionReason: reason,
            }).unwrap();

            toast.success("Ad rejected successfully");
        } catch {
            toast.error("Failed to reject the ad. Please try again.");
        }
    };

    const handleViewProfile = () => {
        if (adData) router.push(`/portal/admin/users/${adData.userId}`);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});

    if (isLoading || isUserLoading) {
        return (
            <div>
                <SiteHeader title={'Ad Campaign Details'} description={''}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="flex items-center justify-center p-12">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Loading details...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !adData) {
        return (
            <div>
                <SiteHeader title={'Ad Campaign Details'} description={''}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="p-12">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-lg font-semibold text-destructive">Error Loading Ad</p>
                                    <p className="text-sm text-muted-foreground">
                                        {error && 'status' in error
                                            ? `Failed to load ad details. Status: ${error.status}`
                                            : 'An unexpected error occurred while loading the ad.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    const actions = isPending ? (
        <>
            <ActionButton onClick={handleApprove} disabled={isRejecting || isApproving}>
                <CheckCircle className="mr-2 h-4 w-4"/>
                {isApproving ? 'Approving...' : 'Approve'}
            </ActionButton>
            <RejectAdModal onReject={handleReject}/>
            <ActionButton
                onClick={handleViewProfile}
                variant="default"
                className="bg-transparent border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 shadow-none"
            >
                <User className="mr-2 h-4 w-4"/>
                View Profile
            </ActionButton>
        </>
    ) : (
        <ActionButton
            onClick={handleViewProfile}
            variant="default"
            className="bg-transparent border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 shadow-none"
        >
            <User className="mr-2 h-4 w-4"/>
            View Profile
        </ActionButton>
    );

    return (
        <div>
            <SiteHeader title={adData.title} description={'Ad Campaign Details'}/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <AdDetailsStats status={adData.status} formatType={adData.formatType} isAdmin={true}
                                        actions={actions} stats={statsData}/>

                        {userData ? (
                            <Card
                                className="m-4 border shadow-sm bg-gradient-to-br from-violet-50/50 to-indigo-50/50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-900">
                                <CardHeader className="border-b border-violet-200 dark:border-violet-900">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                        User Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <User className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                                <p className="text-base font-semibold">{`${userData.firstName} ${userData.lastName}`}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                <p className="text-base font-semibold break-all">{userData.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Role</p>
                                                <Badge
                                                    className="mt-1 bg-violet-600 hover:bg-violet-700 text-white capitalize">
                                                    {userData.role}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Ads
                                                    Purchased</p>
                                                <p className="text-base font-semibold">{userData.totalPurchasedAdsCount}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <DollarSign className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                                                <p className="text-base font-semibold">{formatCurrency(userData.totalSpent)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-background shadow-sm">
                                                <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Member
                                                    Since</p>
                                                <p className="text-base font-semibold">{formatDate(userData.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        <AdStatusDetails className="m-4" data={adData} isAdmin={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
