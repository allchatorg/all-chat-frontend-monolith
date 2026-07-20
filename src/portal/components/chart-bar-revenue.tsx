"use client"

import * as React from "react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@ads/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@ads/components/ui/chart"
import {useGetMonthlyRevenueQuery, useGetWeeklyRevenueQuery} from "@ads/store/services/adminAdsApi"
import {Skeleton} from "@ads/components/ui/skeleton"

const monthlyChartConfig = {
    revenue: {
        label: "Ad Revenue",
        color: "blue",
    },
    promotedRevenue: {
        label: "Message Promotions",
        color: "orange",
    },
}

const weeklyChartConfig = {
    revenue: {
        label: "Ad Revenue",
        color: "blue",
    },
    promotedRevenue: {
        label: "Message Promotions",
        color: "orange",
    },
}

export function ChartBarRevenue() {
    // Fetch monthly and weekly revenue data
    const {data: monthlyData, isLoading: isMonthlyLoading, isError: isMonthlyError} = useGetMonthlyRevenueQuery()
    const {data: weeklyData, isLoading: isWeeklyLoading, isError: isWeeklyError} = useGetWeeklyRevenueQuery()

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Revenue Over Months */}
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Revenue Over Months</CardTitle>
                    <CardDescription>
                        Monthly revenue for the current year
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    {isMonthlyLoading ? (
                        <Skeleton className="h-[250px] w-full"/>
                    ) : isMonthlyError ? (
                        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                            Failed to load monthly revenue data
                        </div>
                    ) : (
                        <ChartContainer
                            config={monthlyChartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <BarChart data={monthlyData?.data || []}>
                                <CartesianGrid vertical={false}/>
                                <ChartLegend content={<ChartLegendContent/>}/>
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => `$${value.toLocaleString()}`}
                                            indicator="line"
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="promotedRevenue"
                                    fill="var(--color-promotedRevenue)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Revenue Over Week */}
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Revenue Over Week</CardTitle>
                    <CardDescription>
                        Daily revenue for the last 7 days
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    {isWeeklyLoading ? (
                        <Skeleton className="h-[250px] w-full"/>
                    ) : isWeeklyError ? (
                        <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                            Failed to load weekly revenue data
                        </div>
                    ) : (
                        <ChartContainer
                            config={weeklyChartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <BarChart data={weeklyData?.data || []}>
                                <CartesianGrid vertical={false}/>
                                <ChartLegend content={<ChartLegendContent/>}/>
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => `$${value.toLocaleString()}`}
                                            indicator="line"
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="promotedRevenue"
                                    fill="var(--color-promotedRevenue)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
