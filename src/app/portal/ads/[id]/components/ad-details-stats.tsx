import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import * as React from 'react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@ads/components/ui/chart";
import {CartesianGrid, Line, LineChart, XAxis} from "recharts";
import {VerticalBarCard} from "@/app/portal/ads/[id]/components/vertical-bar-card";
import {TotalViewsCard} from "@/app/portal/ads/[id]/components/total-views-card";
import {AdDailyStatsResponse, AdStatus} from "@ads/models/ad";

const chartConfig = {
    viewsCount: {
        label: "Page Views",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

interface AdDetailsStatsProps {
    status?: AdStatus;
    totalViewsCardTitle?: string;
    comparisonText?: string;
    isAdmin?: boolean;
    actions?: React.ReactNode;
    stats?: AdDailyStatsResponse;
}

export function AdDetailsStats({
                                   status,
                                   totalViewsCardTitle = "Today's Views",
                                   comparisonText = "from yesterday",
                                   isAdmin = false,
                                   actions,
                                   stats
                               }: AdDetailsStatsProps) {
    // Hide statistics for submitted and rejected ads
    const showStats = !status || (status !== AdStatus.SUBMITTED && status !== AdStatus.REJECTED);

    const getHeaderContent = () => {
        if (status === AdStatus.SUBMITTED) {
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
                    </div>
                )}
            </CardHeader>
            {showStats && (
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={stats?.dailyStats?.slice().reverse() || []}
                            margin={{
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
                </CardContent>
            )}
        </Card>
    );
}