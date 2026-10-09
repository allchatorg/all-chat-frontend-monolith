"use client"

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card';
import {ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip} from '@ads/components/ui/chart';
import {useGetMonthlyRevenueQuery, useGetWeeklyRevenueQuery} from '@ads/store/services/adminAdsApi';
import {dashboardRevenueQueryOptions} from '@ads/store/services/adminProApi';
import {Skeleton} from '@ads/components/ui/skeleton';
import {ProReportingSynchronization} from '@ads/models/pro-statistics';
import {formatUsd, reportingStatusMessage} from '@ads/lib/revenue-format';

const chartConfig = {
    revenue: {label: 'Ad revenue', color: '#2563eb'},
    promotedRevenue: {label: 'Message promotions', color: '#ea580c'},
    roomPromotedRevenue: {label: 'Room promotions', color: '#a855f7'},
    subscriptionRevenue: {label: 'allchat VIP', color: '#059669'},
};

interface RevenuePoint {
    label: string;
    revenue: number;
    promotedRevenue: number;
    roomPromotedRevenue: number;
    subscriptionRevenue: number;
}

function RevenueChart({title, description, data, loading, error, synchronization}: {
    title: string;
    description: string;
    data?: RevenuePoint[];
    loading: boolean;
    error: boolean;
    synchronization?: ProReportingSynchronization;
}) {
    const subscriptionUnavailable = !synchronization || synchronization.status === 'UNAVAILABLE';
    const chartData = data?.map(point => ({...point, subscriptionRevenue: subscriptionUnavailable ? null : point.subscriptionRevenue ?? null}));
    const syncMessage = reportingStatusMessage(synchronization);
    const hasRevenue = chartData?.some(point => point.revenue !== 0 || point.promotedRevenue !== 0
        || point.roomPromotedRevenue !== 0 || (point.subscriptionRevenue !== null && point.subscriptionRevenue !== 0));

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {!loading && !error && syncMessage && <p role="status" className="text-xs text-amber-700 dark:text-amber-400">{syncMessage}</p>}
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {loading ? <Skeleton className="h-[280px] w-full"/> : error || !chartData ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Revenue data is unavailable.</div>
                ) : !hasRevenue ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No revenue recorded for this period yet.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full" aria-label={title}>
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false}/>
                            <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-2"/>}/>
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8}/>
                            <YAxis tickLine={false} axisLine={false} tickMargin={8}
                                   tickFormatter={value => Number(value) >= 1000 ? `$${(Number(value) / 1000).toLocaleString()}k` : `$${value}`}/>
                            <ChartTooltip filterNull={false} cursor={false} content={({active, label}) => {
                                const point = chartData.find(item => item.label === label);
                                if (!active || !point) return null;
                                return (
                                    <div className="grid min-w-52 gap-2 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                                        <p className="font-medium">{point.label}</p>
                                        {Object.entries(chartConfig).map(([key, config]) => {
                                            const value = point[key as keyof Omit<RevenuePoint, 'label'>];
                                            return <div key={key} className="flex items-center justify-between gap-4">
                                                <span className="flex items-center gap-2"><span className="size-2 rounded-sm" style={{backgroundColor: config.color}}/>{config.label}</span>
                                                <span className="font-mono tabular-nums">{value === null ? 'Unavailable' : formatUsd(value)}</span>
                                            </div>;
                                        })}
                                        {point.subscriptionRevenue === null && <p className="max-w-60 text-muted-foreground">Subscription reporting is unavailable.</p>}
                                    </div>
                                );
                            }}/>
                            {Object.keys(chartConfig).map(key => <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]}/>)}
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

export function ChartBarRevenue() {
    const {data: monthlyData, isLoading: isMonthlyLoading, isError: isMonthlyError} = useGetMonthlyRevenueQuery(undefined, dashboardRevenueQueryOptions);
    const {data: weeklyData, isLoading: isWeeklyLoading, isError: isWeeklyError} = useGetWeeklyRevenueQuery(undefined, dashboardRevenueQueryOptions);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueChart title="Revenue over months" description="Monthly revenue for the current year"
                          data={monthlyData?.data.map(point => ({...point, label: point.month}))}
                          loading={isMonthlyLoading} error={isMonthlyError}
                          synchronization={monthlyData?.subscriptionSynchronization}/>
            <RevenueChart title="Revenue over week" description="Daily revenue for the last 7 days"
                          data={weeklyData?.data.map(point => ({...point, label: point.day}))}
                          loading={isWeeklyLoading} error={isWeeklyError}
                          synchronization={weeklyData?.subscriptionSynchronization}/>
        </div>
    );
}
