"use client"

import {useEffect, useState} from 'react';
import {Area, AreaChart, CartesianGrid, XAxis} from 'recharts';
import {dashboardRevenueQueryOptions, useGetProStatisticsQuery} from '@ads/store/services/adminProApi';
import {ProStatisticsDailyPoint, ProStatisticsDays} from '@ads/models/pro-statistics';
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card';
import {ChartContainer, ChartTooltip, ChartTooltipContent} from '@ads/components/ui/chart';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@ads/components/ui/select';
import {ToggleGroup, ToggleGroupItem} from '@ads/components/ui/toggle-group';
import {Button} from '@ads/components/ui/button';
import {Skeleton} from '@ads/components/ui/skeleton';
import {useIsMobile} from '@ads/hooks/use-mobile';
import {computeRevenueTrend, formatReportingDay, formatSynchronizationTime, formatUsd, reportingStatusMessage} from '@ads/lib/revenue-format';

const revenueConfig = {revenue: {label: 'Net revenue', color: '#059669'}};

function ProMetricCard({title, value, description}: {title: string; value: string; description: string}) {
    return (
        <Card className="gap-2 py-4">
            <CardHeader className="gap-2 px-4">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-xl tabular-nums sm:text-2xl">{value}</CardTitle>
                <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </CardHeader>
        </Card>
    );
}

function ProChart({daily}: {daily: ProStatisticsDailyPoint[]}) {
    return (
        <ChartContainer config={revenueConfig} className="aspect-auto h-[250px] w-full" aria-label="allchat Pro revenue by day">
            <AreaChart data={daily} accessibilityLayer margin={{top: 12}}>
                <defs>
                    <linearGradient id="fillSubscriptionRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatReportingDay}/>
                <ChartTooltip cursor={false} content={
                    <ChartTooltipContent labelFormatter={formatReportingDay} indicator="dot" formatter={value => (
                        <>
                            <span className="size-2.5 shrink-0 rounded-[2px] bg-[var(--color-revenue)]"/>
                            <span className="flex flex-1 items-center justify-between gap-4 leading-none">
                                <span className="text-muted-foreground">{revenueConfig.revenue.label}</span>
                                <span className="font-mono font-medium tabular-nums">{formatUsd(Number(value))}</span>
                            </span>
                        </>
                    )}/>
                }/>
                <Area dataKey="revenue" type="natural" fill="url(#fillSubscriptionRevenue)" stroke="var(--color-revenue)"/>
            </AreaChart>
        </ChartContainer>
    );
}

export function AdminProStatistics() {
    const isMobile = useIsMobile();
    const [days, setDays] = useState<ProStatisticsDays>(90);

    useEffect(() => {
        if (isMobile) setDays(7);
    }, [isMobile]);

    const {currentData: data, isFetching, isError, refetch} = useGetProStatisticsQuery(days, dashboardRevenueQueryOptions);
    const loading = isFetching && !data;
    const unavailable = isError || !data;
    const revenueUnavailable = unavailable || data.synchronization.status === 'UNAVAILABLE';
    const partial = data?.synchronization.status !== 'CURRENT';
    const syncMessage = data && !isError ? reportingStatusMessage(data.synchronization) : null;
    const daily = data?.daily ?? [];
    const rangeLabel = days === 90 ? 'Last 3 months' : `Last ${days} days`;
    const rangeRevenue = daily.reduce((total, point) => total + point.revenue, 0);
    const onRangeChange = (value: string) => {
        if (value) setDays(Number(value) as ProStatisticsDays);
    };
    const hasPayments = daily.some(point => point.initialPayments + point.renewalPayments + point.otherPayments > 0);
    const todayTrend = data && !partial
        ? computeRevenueTrend(data.revenue.today, data.revenue.yesterday).trendValue
        : null;
    const todayDescription = revenueUnavailable ? 'Payment reporting could not be loaded'
        : partial ? 'Partial revenue while payment history is incomplete'
            : todayTrend ? `${todayTrend} compared to yesterday`
                : `Yesterday: ${formatUsd(data!.revenue.yesterday)}`;

    return (
        <section className="space-y-4 px-4 lg:px-6" aria-labelledby="pro-statistics-heading">
            <div>
                <h2 id="pro-statistics-heading" className="text-lg font-semibold">allchat Pro</h2>
                <p className="text-sm text-muted-foreground">Current paid memberships and subscription payments.</p>
            </div>
            {syncMessage && (
                <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                    {syncMessage}
                    {data?.synchronization.lastSynchronizedAt && <span className="mt-1 block text-xs text-muted-foreground">Last synchronized: {formatSynchronizationTime(data.synchronization.lastSynchronizedAt)}.</span>}
                </div>
            )}
            {!loading && unavailable ? (
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3" role="alert">
                        <p className="text-sm text-muted-foreground">allchat Pro statistics are unavailable.</p>
                        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>Retry</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 @5xl/main:grid-cols-5">
                    {loading ? Array.from({length: 5}, (_, index) => <Skeleton key={index} className="h-32 rounded-xl"/>) : data && (
                        <>
                            <ProMetricCard title="Active paid members" value={data.memberships.active.toLocaleString()}
                                           description={`${data.memberships.monthly.toLocaleString()} monthly · ${data.memberships.yearly.toLocaleString()} yearly`}/>
                            <ProMetricCard title="Scheduled cancellations" value={data.memberships.scheduledCancellations.toLocaleString()}
                                           description="Paid members whose subscriptions will not renew"/>
                            <ProMetricCard title="Payment issues" value={data.memberships.paymentIssues.toLocaleString()}
                                           description="Current subscriptions past due or unpaid"/>
                            <ProMetricCard title={`Subscription revenue today${!revenueUnavailable && partial ? ' (partial)' : ''}`}
                                           value={revenueUnavailable ? 'Unavailable' : formatUsd(data.revenue.today)} description={todayDescription}/>
                            <ProMetricCard title={`Total subscription revenue${!revenueUnavailable && partial ? ' (partial)' : ''}`}
                                           value={revenueUnavailable ? 'Unavailable' : formatUsd(data.revenue.total)}
                                           description="All-time revenue"/>
                        </>
                    )}
                </div>
            )}
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Subscription Revenue</CardTitle>
                    <CardDescription>
                        <span className="hidden @[540px]/card:block">
                            Total for the {rangeLabel.toLowerCase()}
                            {!loading && !revenueUnavailable && ` — ${partial ? 'Partial total' : 'Total'}: ${formatUsd(rangeRevenue)}`}
                        </span>
                        <span className="@[540px]/card:hidden">{rangeLabel}</span>
                    </CardDescription>
                    <CardAction>
                        <ToggleGroup type="single" value={String(days)} onValueChange={onRangeChange} variant="outline"
                                     aria-label="Subscription reporting range"
                                     className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex">
                            <ToggleGroupItem value="90">Last 3 months</ToggleGroupItem>
                            <ToggleGroupItem value="30">Last 30 days</ToggleGroupItem>
                            <ToggleGroupItem value="7">Last 7 days</ToggleGroupItem>
                        </ToggleGroup>
                        <Select value={String(days)} onValueChange={onRangeChange}>
                            <SelectTrigger className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                                           size="sm" aria-label="Subscription reporting range">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="90" className="rounded-lg">Last 3 months</SelectItem>
                                <SelectItem value="30" className="rounded-lg">Last 30 days</SelectItem>
                                <SelectItem value="7" className="rounded-lg">Last 7 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardAction>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    {loading ? <Skeleton className="h-[250px] w-full"/> : revenueUnavailable ? (
                        <div className="flex h-[250px] items-center justify-center text-center text-sm text-muted-foreground">Subscription revenue is unavailable.</div>
                    ) : !hasPayments ? (
                        <div className="flex h-[250px] items-center justify-center p-4 text-center text-sm text-muted-foreground">
                            {partial ? 'No subscription revenue has been recorded for this range yet. Reporting is incomplete.' : 'No subscription revenue recorded for this period yet.'}
                        </div>
                    ) : <ProChart daily={daily}/>}
                    <p className="mt-3 text-xs text-muted-foreground">Refunds reduce revenue on the original payment date.</p>
                </CardContent>
            </Card>
        </section>
    );
}
