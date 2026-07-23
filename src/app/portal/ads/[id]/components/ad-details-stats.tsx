import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import * as React from 'react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@ads/components/ui/chart";
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts";
import {VerticalBarCard} from "@/app/portal/ads/[id]/components/vertical-bar-card";
import {TotalViewsCard} from "@/app/portal/ads/[id]/components/total-views-card";
import {ClicksCtrCard} from "@/app/portal/ads/[id]/components/clicks-ctr-card";
import {LinkStatsCard} from "@/app/portal/ads/[id]/components/link-stats-card";
import {AdDailyStatsResponse, AdFormatType, AdStatus} from "@ads/models/ad";

const chartConfig = {
    viewsCount: {
        label: "Page Views",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

interface AdDetailsStatsProps {
    status?: AdStatus;
    formatType?: AdFormatType;
    totalViewsCardTitle?: string;
    comparisonText?: string;
    isAdmin?: boolean;
    actions?: React.ReactNode;
    stats?: AdDailyStatsResponse;
}

export function AdDetailsStats({
                                   status,
                                   formatType,
                                   totalViewsCardTitle = "Today's Views",
                                   comparisonText = "from yesterday",
                                   isAdmin = false,
                                   actions,
                                   stats
                               }: AdDetailsStatsProps) {
    // Hide statistics for pending and rejected ads
    const showStats = !status || (status !== AdStatus.PENDING && status !== AdStatus.REJECTED);

    // Text ads can't earn clicks (only media opens are tracked), so their
    // clicks/CTR UI is hidden entirely rather than shown forever-empty.
    const showClickStats = showStats && formatType !== AdFormatType.TEXT;

    const hasClickData = (stats?.dailyStats?.some(day => day.clicksCount > 0)) ?? false;

    const hasViewsData = (stats?.dailyStats?.some(day => day.viewsCount > 0)) ?? false;

    // Media click-throughs are labeled by the ad's format so they can't be
    // confused with the separately-tracked hyperlink clicks below.
    const mediaClicksLabel = formatType === AdFormatType.PHOTO
        ? "Photo Clicks"
        : formatType === AdFormatType.VIDEO
            ? "Video Clicks"
            : "Photo & Video Clicks";

    const clicksChartConfig = {
        clicksCount: {
            label: mediaClicksLabel,
            color: "hsl(var(--chart-2))",
        },
        ctr: {
            label: "CTR",
            color: "hsl(var(--chart-3))",
        },
    } satisfies ChartConfig

    const linkStats = stats?.linkStats ?? [];

    const getHeaderContent = () => {
        if (status === AdStatus.PENDING) {
            return {
                title: isAdmin ? "Ad Review" : "Ad Status",
                description: isAdmin
                    ? "Review the ad details below."
                    : "Your ad is currently under review."
            };
        }
        if (status === AdStatus.REJECTED) {
            return {
                title: isAdmin ? "Rejected Ad" : "Ad Status",
                description: isAdmin
                    ? "This ad has been rejected."
                    : "Your ad has been rejected."
            };
        }
        return {
            title: isAdmin ? "Ad Performance" : "Your Ad Performance",
            description: isAdmin
                ? "Ad dashboard with all stats."
                : "Your ad dashboard with all stats where you can track everything."
        };
    };

    const {title, description} = getHeaderContent();

    return (
        <Card className="py-0 border-none shadow-none rounded-none">
            <CardHeader
                className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between border-b">
                <div className="flex flex-col gap-1 lg:max-w-md">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>
                        {description}
                    </CardDescription>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
                {showStats && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <TotalViewsCard title={totalViewsCardTitle}
                                        currentValue={stats?.todaysViews || 0}
                                        previousValue={stats?.yesterdaysViews || 0}
                                        comparisonText={comparisonText}
                                        className={'flex-1 sm:min-w-[180px] lg:min-w-48 lg:max-w-48'}/>
                        <VerticalBarCard title={"Served Views"}
                                         current={stats?.servedViews || 0}
                                         max={stats?.viewsBought || 0}
                                         className={"flex-1 sm:min-w-[180px] lg:min-w-48 lg:max-w-48"}/>
                        {showClickStats && (
                            <ClicksCtrCard title={`Total ${mediaClicksLabel}`}
                                           totalClicks={stats?.totalClicks || 0}
                                           todaysClicks={stats?.todaysClicks || 0}
                                           ctr={stats?.overallCtr || 0}
                                           className={"flex-1 sm:min-w-[180px] lg:min-w-48 lg:max-w-48"}/>
                        )}
                    </div>
                )}
            </CardHeader>
            {showStats && (
                <CardContent className="px-2 sm:p-6">
                    <div className="mb-2 px-4 sm:px-0">
                        <h3 className="text-sm font-medium">Page Views</h3>
                        <p className="text-xs text-muted-foreground">
                            Daily views of your ad
                        </p>
                    </div>
                    {hasViewsData ? (
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <LineChart
                                accessibilityLayer
                                data={stats?.dailyStats?.slice().reverse() || []}
                                margin={{
                                    top: 12,
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[150px]"
                                            nameKey="viewsCount"
                                            labelFormatter={(value) => {
                                                return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                            }}
                                        />
                                    }
                                />
                                <Line
                                    dataKey="viewsCount"
                                    type="monotone"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <div
                            className="flex h-[250px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
                            No views yet — views appear here once your ad starts being served.
                        </div>
                    )}
                </CardContent>
            )}
            {showClickStats && (
                <CardContent className="px-2 pb-6 sm:px-6 sm:pt-0">
                    <div className="mb-2 px-4 sm:px-0">
                        <h3 className="text-sm font-medium">{mediaClicksLabel} & CTR</h3>
                        <p className="text-xs text-muted-foreground">
                            Daily {mediaClicksLabel.toLowerCase()} and click-through rate
                        </p>
                    </div>
                    {hasClickData ? (
                        <ChartContainer
                            config={clicksChartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <LineChart
                                accessibilityLayer
                                data={stats?.dailyStats?.slice().reverse() || []}
                                margin={{
                                    top: 12,
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <YAxis yAxisId="clicks" hide/>
                                <YAxis
                                    yAxisId="ctr"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={44}
                                    tickFormatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[180px]"
                                            labelFormatter={(value) => {
                                                return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                            }}
                                            formatter={(value, name) => (
                                                <div className="flex w-full items-center justify-between gap-2">
                                                    <span className="text-muted-foreground">
                                                        {clicksChartConfig[name as keyof typeof clicksChartConfig]?.label ?? name}
                                                    </span>
                                                    <span className="font-mono font-medium tabular-nums text-foreground">
                                                        {name === "ctr"
                                                            ? `${(Number(value) * 100).toFixed(2)}%`
                                                            : Number(value).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <Line
                                    yAxisId="clicks"
                                    dataKey="clicksCount"
                                    type="monotone"
                                    stroke="var(--color-clicksCount)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    yAxisId="ctr"
                                    dataKey="ctr"
                                    type="monotone"
                                    stroke="var(--color-ctr)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <div
                            className="flex h-[250px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
                            No clicks yet — clicks appear here when users open your photo or video ad.
                        </div>
                    )}
                </CardContent>
            )}
            {/* Hyperlink stats apply to all formats (TEXT included), unlike media clicks */}
            {showStats && linkStats.length > 0 && (
                <CardContent className="px-2 pb-6 sm:px-6 sm:pt-0">
                    <div className="mb-2 px-4 sm:px-0">
                        <h3 className="text-sm font-medium">Hyperlink Clicks</h3>
                        <p className="text-xs text-muted-foreground">
                            Daily clicks on each link in your ad text
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        {linkStats.map((link) => (
                            <LinkStatsCard key={link.url} link={link}/>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}