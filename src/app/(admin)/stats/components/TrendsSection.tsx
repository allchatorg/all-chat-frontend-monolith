"use client"

import {useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import {Minus, TrendingDown, TrendingUp} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {getSiteTrends} from "@/api/admin/adminAPI";
import {SiteTrends, TrendMetric, TrendPeriod} from "@/models/SiteStatistics";
import {cn, formatFileSize} from "@/lib/utils";

const count = (value: number) => value.toLocaleString();

const METRICS: Record<TrendMetric, {label: string; color: string; format: (value: number) => string}> = {
    messages: {label: "Messages", color: "hsl(var(--chart-1))", format: count},
    newAccounts: {label: "New accounts", color: "hsl(var(--chart-2))", format: count},
    roomsCreated: {label: "Rooms created", color: "hsl(var(--chart-3))", format: count},
    uploadedBytes: {label: "Uploads", color: "hsl(var(--chart-4))", format: formatFileSize},
    bansIssued: {label: "Bans issued", color: "hsl(var(--chart-5))", format: count},
};

const PERIODS: {value: TrendPeriod; label: string; description: string}[] = [
    {value: "WEEK", label: "Week", description: "Last 7 days, compared with the 7 days before"},
    {value: "MONTH", label: "Month", description: "Last 30 days, compared with the 30 days before"},
    {value: "YEAR", label: "Year", description: "Last 12 months, compared with the 12 months before"},
    {value: "ALL", label: "All time", description: "Everything recorded"},
];

// Bucket starts arrive as plain dates; noon keeps them on the same day in every timezone.
// Axis ticks use the short month form ("Jun '26") so all twelve months of a year fit.
const formatBucket = (value: string, bucket: SiteTrends["bucket"], short = false) => {
    const date = new Date(`${value}T12:00:00`);
    if (bucket === "DAY") return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
    return short
        ? `${date.toLocaleDateString("en-US", {month: "short"})} '${String(date.getFullYear()).slice(2)}`
        : date.toLocaleDateString("en-US", {month: "short", year: "numeric"});
};

function Change({current, previous, format}: {current: number; previous: number; format: (value: number) => string}) {
    if (current === previous) {
        return <span className="flex items-center gap-1"><Minus className="h-3.5 w-3.5"/>No change</span>;
    }
    const Icon = current > previous ? TrendingUp : TrendingDown;
    const percent = Math.round(Math.abs(current - previous) / previous * 100);
    const change = previous === 0 ? "Up from 0" : `${current > previous ? "+" : "−"}${percent || "<1"}%`;
    return (
        <span className="flex items-center gap-1">
            <Icon className="h-3.5 w-3.5 shrink-0"/>
            <span className="font-medium text-foreground">{change}</span>
            {previous > 0 && <span className="truncate">(was {format(previous)})</span>}
        </span>
    );
}

interface TrendsSectionProps {
    refreshToken: number;
}

export function TrendsSection({refreshToken}: TrendsSectionProps) {
    const [period, setPeriod] = useState<TrendPeriod>("MONTH");
    const [metric, setMetric] = useState<TrendMetric>("messages");
    const [trends, setTrends] = useState<SiteTrends | null>(null);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        // Ignore answers for a period the user has already switched away from.
        let ignore = false;
        setError(false);
        getSiteTrends(period)
            .then(data => !ignore && setTrends(data))
            .catch(() => !ignore && setError(true));
        return () => {
            ignore = true;
        };
    }, [period, refreshToken, attempt]);

    const ready = trends?.period === period ? trends : null;
    const {label, color, format} = METRICS[metric];
    const chartConfig = {[metric]: {label, color}} satisfies ChartConfig;
    const hasActivity = ready?.points.some(point => point[metric] > 0);
    const description = period === "ALL" && ready?.points.length
        ? `Everything since ${formatBucket(ready.points[0].start, ready.bucket)}`
        : PERIODS.find(option => option.value === period)!.description;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 space-y-0 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div className="space-y-1.5">
                    <CardTitle className="text-lg sm:text-xl">Trends</CardTitle>
                    <CardDescription>
                        {description}
                        {ready && ` · per ${ready.bucket === "DAY" ? "day" : "month"} · ${ready.zone}`}
                    </CardDescription>
                </div>
                <Tabs value={period} onValueChange={value => setPeriod(value as TrendPeriod)}>
                    <TabsList>
                        {PERIODS.map(option => (
                            <TabsTrigger key={option.value} value={option.value}>{option.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="space-y-4 px-2 pb-4 sm:px-6 sm:pb-6">
                {error && !ready ? (
                    <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                        Trends could not be loaded.
                        <Button size="sm" variant="outline" onClick={() => setAttempt(value => value + 1)}>Retry</Button>
                    </div>
                ) : !ready ? (
                    <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            {Array.from({length: 5}, (_, index) => <Skeleton key={index} className="h-24 rounded-lg"/>)}
                        </div>
                        <Skeleton className="h-[260px] w-full"/>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            {(Object.keys(METRICS) as TrendMetric[]).map(key => (
                                <button key={key} type="button" onClick={() => setMetric(key)} aria-pressed={metric === key}
                                        className={cn("rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                                            metric === key && "border-primary bg-accent")}>
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="size-2.5 shrink-0 rounded-[2px]" style={{backgroundColor: METRICS[key].color}}/>
                                        {METRICS[key].label}
                                    </span>
                                    <span className="mt-1 block text-xl font-semibold tabular-nums sm:text-2xl">
                                        {METRICS[key].format(ready.current[key])}
                                    </span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                        {ready.previous
                                            ? <Change current={ready.current[key]} previous={ready.previous[key]} format={METRICS[key].format}/>
                                            : "Total for all time"}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {!hasActivity ? (
                            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                                No {label.toLowerCase()} in this period yet.
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full"
                                            aria-label={`${label} per ${ready.bucket === "DAY" ? "day" : "month"}`}>
                                <BarChart data={ready.points} accessibilityLayer margin={{top: 12}}>
                                    <CartesianGrid vertical={false}/>
                                    <XAxis dataKey="start" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24}
                                           interval="equidistantPreserveStart"
                                           tickFormatter={value => formatBucket(value, ready.bucket, true)}/>
                                    <ChartTooltip cursor={false} content={
                                        <ChartTooltipContent labelFormatter={value => formatBucket(String(value), ready.bucket)}
                                                             formatter={value => (
                                            <>
                                                <span className="size-2.5 shrink-0 rounded-[2px]" style={{backgroundColor: color}}/>
                                                <span className="flex flex-1 items-center justify-between gap-4 leading-none">
                                                    <span className="text-muted-foreground">{label}</span>
                                                    <span className="font-mono font-medium tabular-nums">{format(Number(value))}</span>
                                                </span>
                                            </>
                                        )}/>
                                    }/>
                                    <Bar dataKey={metric} fill={`var(--color-${metric})`} radius={4}/>
                                </BarChart>
                            </ChartContainer>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
