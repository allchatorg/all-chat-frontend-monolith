"use client"

import * as React from "react"
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts"

import {useIsMobile} from "@ads/hooks/use-mobile"
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,} from "@ads/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent,} from "@ads/components/ui/chart"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@ads/components/ui/select"
import {ToggleGroup, ToggleGroupItem,} from "@ads/components/ui/toggle-group"
import {useGetPurchasedAdsCountsQuery} from "@ads/store/services/adminAdsApi"
import {Skeleton} from "@ads/components/ui/skeleton"

export const description = "Purchased ads chart"

const chartConfig = {
    purchasedAds: {
        label: "Purchased Ads",
        color: "blue",
    },
}

// Helper to format the date range description
function getDateRangeDescription(days: number): string {
    if (days >= 90) return "Total for the last 3 months"
    if (days >= 30) return "Total for the last 30 days"
    return "Total for the last 7 days"
}

// Helper to calculate the fromDate based on the selected range
function calculateFromDate(daysToSubtract: number): string {
    const date = new Date()
    date.setDate(date.getDate() - daysToSubtract)
    return date.toISOString().split('T')[0]
}

export function ChartAreaPurchasedAds() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    // Calculate days from time range
    const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

    // Fetch purchased ads data from the API
    const {data, isLoading, isError} = useGetPurchasedAdsCountsQuery({
        fromDate: calculateFromDate(daysToSubtract)
    })

    // Transform API data to chart format
    const chartData = React.useMemo(() => {
        if (!data?.dailyCounts) return []
        return data.dailyCounts.map((item) => ({
            date: item.date,
            purchasedAds: item.count
        }))
    }, [data])

    if (isLoading) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Purchased Ads</CardTitle>
                    <CardDescription>Loading chart data...</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <Skeleton className="h-[250px] w-full"/>
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Purchased Ads</CardTitle>
                    <CardDescription className="text-destructive">Error loading chart data</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        Failed to load purchased ads data
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Purchased Ads</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        {getDateRangeDescription(daysToSubtract)} — Total: {data?.totalCount ?? 0} ads
                    </span>
                    <span className="@[540px]/card:hidden">
                        {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 3 months"}
                    </span>
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
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="fillPurchasedAds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-purchasedAds)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-purchasedAds)" stopOpacity={0.1}/>
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
                            dataKey="purchasedAds"
                            type="natural"
                            fill="url(#fillPurchasedAds)"
                            stroke="var(--color-purchasedAds)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
