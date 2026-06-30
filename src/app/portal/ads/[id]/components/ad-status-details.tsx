import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {clsx} from "clsx";
import {
    AlertCircle,
    Calendar,
    CreditCard,
    DollarSign,
    Eye,
    FileText,
    ImageIcon,
    Info,
    TrendingUp,
    Type,
    Video
} from "lucide-react";
import * as React from "react";
import {AdStatusDetails as AdStatusDetailsType} from "@ads/models/ad-status-details";

interface AdStatusDetailsProps {
    data: AdStatusDetailsType;
    className?: string;
    isAdmin?: boolean;
}

export default function AdStatusDetails({data, className, isAdmin = false}: AdStatusDetailsProps) {
    const getStatusConfig = () => {
        switch (data.status) {
            case "ACTIVE":
                return {
                    bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    badgeClass: "bg-green-500 hover:bg-green-600 text-white",
                };
            case "COMPLETED":
                return {
                    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
                    badgeClass: "bg-blue-500 hover:bg-blue-600 text-white",
                };
            case "SUBMITTED":
                return {
                    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
                    badgeClass: "bg-amber-500 hover:bg-amber-600 text-white",
                };
            case "REJECTED":
                return {
                    bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                    badgeClass: "bg-red-500 hover:bg-red-600 text-white",
                };
            default:
                return {
                    bg: "bg-muted/50",
                    badgeClass: "bg-secondary",
                };
        }
    };

    const statusConfig = getStatusConfig();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // Check what content types exist
    const hasMedia = data.imageUrl || data.videoUrl;
    const hasText = data.textContent;

    return (
        <Card className={clsx("border shadow-sm", statusConfig.bg, className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-xl">{data.title}</CardTitle>
                        <CardDescription className="mt-1">Ad ID: #{data.id}</CardDescription>
                    </div>
                    <Badge className={clsx("w-fit", statusConfig.badgeClass)}>
                        {data.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Ad Content Preview Section */}
                {(data.title || hasMedia || hasText) && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <FileText className="h-5 w-5 text-primary"/>
                            <h3 className="text-lg font-semibold">Ad Content Preview</h3>
                        </div>


                        {/* Title Preview */}
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Type className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm font-medium text-muted-foreground">Ad Title</span>
                            </div>
                            <p className="text-lg font-medium">
                                {data.title}
                            </p>
                        </div>

                        {/* Text Content */}
                        {hasText && (
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="h-4 w-4 text-muted-foreground"/>
                                    <span className="text-sm font-medium text-muted-foreground">Text Content</span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {data.textContent}
                                </p>
                            </div>
                        )}

                        {/* Image Content */}
                        {data.imageUrl && (
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground"/>
                                    <span className="text-sm font-medium text-muted-foreground">Image</span>
                                </div>
                                <div className="rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={data.imageUrl}
                                        alt={data.title}
                                        className="w-full h-auto max-h-96 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Video Content */}
                        {data.videoUrl && (
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Video className="h-4 w-4 text-muted-foreground"/>
                                    <span className="text-sm font-medium text-muted-foreground">Video</span>
                                </div>
                                <div className="rounded-lg overflow-hidden bg-black">
                                    <video
                                        controls
                                        className="w-full h-auto max-h-96"
                                        preload="metadata"
                                    >
                                        <source src={data.videoUrl}/>
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Ad Details Section */}
                <div>
                    <div className="flex items-center gap-2 pb-2 mb-4 border-b">
                        <Info className="h-5 w-5 text-primary"/>
                        <h3 className="text-lg font-semibold">Ad Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Format Type */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <TrendingUp className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Format Type</p>
                                <p className="text-base font-semibold">{data.formatType}</p>
                            </div>
                        </div>

                        {/* Views Bought */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <Eye className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Views Bought</p>
                                <p className="text-base font-semibold">{data.viewsBought.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <DollarSign className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                                <p className="text-base font-semibold">{formatCurrency(data.price)}</p>
                            </div>
                        </div>

                        {/* Submitted Date */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <Calendar className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
                                <p className="text-base font-semibold">{formatDate(data.submittedDate)}</p>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <Calendar className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                <p className="text-base font-semibold">{formatDate(data.startDate)}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <CreditCard className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                <p className="text-base font-semibold capitalize">
                                    {data.cardBrand} •••• {data.cardLast4}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rejection Section */}
                {data.status === "REJECTED" && data.rejectionReason && (
                    <div
                        className="rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                                    Rejection Reason
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                    {data.rejectionReason}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Review Section */}
                {data.status === "SUBMITTED" && !isAdmin && (
                    <div
                        className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    Ad Under Review
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    Your ad is currently being reviewed. This process typically takes 1-2 days maximum.
                                    You&apos;ll be notified via email once your ad is approved and starts running.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}