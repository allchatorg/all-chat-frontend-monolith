"use client"

import * as React from "react"
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts"

import {useIsMobile} from "@ads/hooks/use-mobile"
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,} from "@ads/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent,} from "@ads/components/ui/chart"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@ads/components/ui/select"
import {ToggleGroup, ToggleGroupItem,} from "@ads/components/ui/toggle-group"
import {DailyViewStats} from "@ads/models/ad"

export const description = "Daily views chart"

interface ChartAreaInteractiveProps {
    dailyViews?: DailyViewStats[];
    isLoading?: boolean;
}

const chartConfig = {
    viewsCount: {
        label: "Views",
        color: "blue",
    },
}

export function ChartAreaInteractive({dailyViews}: ChartAreaInteractiveProps) {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    // Transform API data to chart format
    const chartData = React.useMemo(() => {
        if (!dailyViews || dailyViews.length === 0) return [];
        return dailyViews.map(item => ({
            date: item.date,
            viewsCount: item.viewsCount,
        }));
    }, [dailyViews]);

    const filteredData = React.useMemo(() => {
        if (chartData.length === 0) return [];

        // Find the most recent date in the data
        const dates = chartData.map(item => new Date(item.date));
        const referenceDate = new Date(Math.max(...dates.map(d => d.getTime())));

        let daysToSubtract = 90;
        if (timeRange === "30d") daysToSubtract = 30;
        else if (timeRange === "7d") daysToSubtract = 7;

        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);

        return chartData.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate;
        });
    }, [chartData, timeRange]);

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Total Views</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Total for the last 3 months
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months"/>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {filteredData.length === 0 ? (
                    <div
                        className="flex h-[250px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
                        No views yet — views appear here once your ads start being served.
                    </div>
                ) : (
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData} margin={{top: 12}}>
                        <defs>
                            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-viewsCount)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-viewsCount)" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {month: "short", day: "numeric"})
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="viewsCount"
                            type="natural"
                            fill="url(#fillViews)"
                            stroke="var(--color-viewsCount)"
                        />
                    </AreaChart>
                </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
